import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, InjectionToken, effect, inject, signal } from '@angular/core';
import type { ConnectionStatus } from 'laravel-echo';
import { BehaviorSubject } from 'rxjs';
import { SessionStore } from '@core/session/session.store';
import { REALTIME_CONFIG } from './realtime.config';
import { RealtimeSocketStore } from './realtime-socket.store';

export type RealtimeConnectionState =
  'connecting' | 'connected' | 'disconnected' | 'unavailable' | 'failed';

export interface RealtimePrivateChannel {
  listen(event: string, callback: (payload: unknown) => void): RealtimePrivateChannel;
  stopListening(event: string, callback?: (payload: unknown) => void): RealtimePrivateChannel;
  subscribed(callback: () => void): RealtimePrivateChannel;
  error(callback: (error: unknown) => void): RealtimePrivateChannel;
}

export interface RealtimePresenceChannel extends RealtimePrivateChannel {
  here(callback: (members: unknown[]) => void): RealtimePresenceChannel;
  joining(callback: (member: unknown) => void): RealtimePresenceChannel;
  leaving(callback: (member: unknown) => void): RealtimePresenceChannel;
}

interface PusherStateChange {
  current: string;
}

interface RealtimeClient {
  connector: {
    onConnectionChange(callback: (status: ConnectionStatus) => void): () => void;
    pusher?: {
      connection: {
        bind(event: 'state_change', callback: (change: PusherStateChange) => void): void;
        unbind(event: 'state_change', callback: (change: PusherStateChange) => void): void;
      };
    };
  };
  private(channel: string): RealtimePrivateChannel;
  join(channel: string): RealtimePresenceChannel;
  leave(channel: string): void;
  leaveAllChannels(): void;
  socketId(): string | undefined;
  connectionStatus(): ConnectionStatus;
  disconnect(): void;
}

type RealtimeClientFactory = (options: Record<string, unknown>) => Promise<RealtimeClient>;

export const REALTIME_CLIENT_FACTORY = new InjectionToken<RealtimeClientFactory>(
  'REALTIME_CLIENT_FACTORY',
  {
    providedIn: 'root',
    factory: () => async (options) => {
      const [{ default: Echo }, { default: Pusher }] = await Promise.all([
        import('laravel-echo'),
        import('pusher-js'),
      ]);

      return new Echo<'reverb'>({
        broadcaster: 'reverb',
        Pusher,
        withoutInterceptors: true,
        ...options,
      }) as unknown as RealtimeClient;
    },
  },
);

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(REALTIME_CONFIG);
  private readonly session = inject(SessionStore);
  private readonly socketStore = inject(RealtimeSocketStore);
  private readonly clientFactory = inject(REALTIME_CLIENT_FACTORY);
  private readonly connectionState = signal<RealtimeConnectionState>('disconnected');
  private readonly connectionStateSubject = new BehaviorSubject<RealtimeConnectionState>(
    'disconnected',
  );
  private readonly privateChannels = new Map<string, RealtimePrivateChannel>();
  private readonly presenceChannels = new Map<string, RealtimePresenceChannel>();

  readonly state = this.connectionState.asReadonly();
  readonly connectionState$ = this.connectionStateSubject.asObservable();

  private client: RealtimeClient | null = null;
  private connectPromise: Promise<void> | null = null;
  private connectionGeneration = 0;
  private unsubscribeConnectionState: (() => void) | null = null;
  private unbindRawConnectionState: (() => void) | null = null;

  constructor() {
    effect(() => {
      if (this.config.enabled && this.session.isAuthenticated()) {
        void this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  initialize(): void {}

  connect(): Promise<void> {
    if (!this.config.enabled || !this.session.isAuthenticated() || this.client) {
      return Promise.resolve();
    }
    if (this.connectPromise) return this.connectPromise;

    const generation = this.connectionGeneration;
    this.updateState('connecting');
    const pendingConnection = this.createClient(generation).finally(() => {
      if (this.connectPromise === pendingConnection) this.connectPromise = null;
    });
    this.connectPromise = pendingConnection;

    return this.connectPromise;
  }

  disconnect(): void {
    this.connectionGeneration += 1;
    this.unsubscribeConnectionState?.();
    this.unbindRawConnectionState?.();
    this.client?.leaveAllChannels();
    this.client?.disconnect();
    this.client = null;
    this.connectPromise = null;
    this.unsubscribeConnectionState = null;
    this.unbindRawConnectionState = null;
    this.privateChannels.clear();
    this.presenceChannels.clear();
    this.socketStore.clear();
    this.updateState('disconnected');
  }

  async private(channel: string): Promise<RealtimePrivateChannel> {
    await this.connect();
    const client = this.requireClient();
    const existing = this.privateChannels.get(channel);
    if (existing) return existing;

    const subscription = client.private(channel);
    this.privateChannels.set(channel, subscription);
    return subscription;
  }

  async presence(channel: string): Promise<RealtimePresenceChannel> {
    await this.connect();
    const client = this.requireClient();
    const existing = this.presenceChannels.get(channel);
    if (existing) return existing;

    const subscription = client.join(channel);
    this.presenceChannels.set(channel, subscription);
    return subscription;
  }

  join(channel: string): Promise<RealtimePresenceChannel> {
    return this.presence(channel);
  }

  leave(channel: string): void {
    this.privateChannels.delete(channel);
    this.presenceChannels.delete(channel);
    this.client?.leave(channel);
  }

  leaveAll(): void {
    this.privateChannels.clear();
    this.presenceChannels.clear();
    this.client?.leaveAllChannels();
  }

  socketId(): string | null {
    return this.socketStore.socketId();
  }

  private async createClient(generation: number): Promise<void> {
    try {
      const client = await this.clientFactory({
        key: this.config.appKey,
        wsHost: this.config.wsHost,
        wsPort: this.config.wsPort,
        wssPort: this.config.wssPort,
        forceTLS: this.config.forceTLS,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        authorizer: (channel: { name: string }) => ({
          authorize: (
            socketId: string,
            callback: (error: unknown, data: Record<string, string> | null) => void,
          ) => {
            this.http
              .post<Record<string, string>>(
                this.config.authEndpoint,
                { socket_id: socketId, channel_name: channel.name },
                { withCredentials: true },
              )
              .subscribe({
                next: (response) => callback(null, response),
                error: (error: HttpErrorResponse) => callback(error, null),
              });
          },
        }),
      });

      if (generation !== this.connectionGeneration || !this.session.isAuthenticated()) {
        client.disconnect();
        return;
      }

      this.client = client;
      this.bindConnectionState(client);
    } catch {
      if (generation === this.connectionGeneration) this.updateState('failed');
    }
  }

  private bindConnectionState(client: RealtimeClient): void {
    const rawConnection = client.connector.pusher?.connection;
    if (rawConnection) {
      const stateChange = (change: PusherStateChange): void => {
        this.updateState(normalizeConnectionState(change.current));
      };
      rawConnection.bind('state_change', stateChange);
      this.unbindRawConnectionState = () => rawConnection.unbind('state_change', stateChange);
    } else {
      this.unsubscribeConnectionState = client.connector.onConnectionChange((status) => {
        this.updateState(normalizeConnectionState(status));
      });
    }

    this.updateState(normalizeConnectionState(client.connectionStatus()));
  }

  private updateState(state: RealtimeConnectionState): void {
    if (this.connectionState() === state) return;
    this.connectionState.set(state);
    this.connectionStateSubject.next(state);
    if (state === 'connected') {
      this.socketStore.set(this.client?.socketId());
    } else {
      this.socketStore.clear();
    }
  }

  private requireClient(): RealtimeClient {
    if (!this.client) throw new Error('Realtime connection is not available.');
    return this.client;
  }
}

function normalizeConnectionState(state: string): RealtimeConnectionState {
  if (state === 'connected') return 'connected';
  if (state === 'connecting' || state === 'reconnecting') return 'connecting';
  if (state === 'unavailable') return 'unavailable';
  if (state === 'failed') return 'failed';
  return 'disconnected';
}
