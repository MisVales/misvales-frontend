import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { ConnectionStatus } from 'laravel-echo';
import { vi } from 'vitest';
import { SessionStore } from '@core/session/session.store';
import { REALTIME_CONFIG } from './realtime.config';
import { REALTIME_CLIENT_FACTORY, RealtimeService } from './realtime.service';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let session: InstanceType<typeof SessionStore>;
  let http: HttpTestingController;
  let connectionCallback: (status: ConnectionStatus) => void;

  const unsubscribeState = vi.fn();
  const privateChannel = {
    listen: vi.fn(() => privateChannel),
    stopListening: vi.fn(() => privateChannel),
    subscribed: vi.fn(() => privateChannel),
    error: vi.fn(() => privateChannel),
  };
  const presenceChannel = {
    ...privateChannel,
    here: vi.fn(() => presenceChannel),
    joining: vi.fn(() => presenceChannel),
    leaving: vi.fn(() => presenceChannel),
  };
  const client = {
    connector: {
      onConnectionChange: vi.fn((callback: (status: ConnectionStatus) => void) => {
        connectionCallback = callback;
        return unsubscribeState;
      }),
    },
    private: vi.fn(() => privateChannel),
    join: vi.fn(() => presenceChannel),
    leave: vi.fn(),
    leaveAllChannels: vi.fn(),
    socketId: vi.fn(() => '123.456'),
    connectionStatus: vi.fn((): ConnectionStatus => 'connecting'),
    disconnect: vi.fn(),
  };
  const factory = vi.fn(async (_options: Record<string, unknown>) => client);

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: REALTIME_CONFIG,
          useValue: {
            enabled: true,
            appKey: 'public-key',
            wsHost: 'localhost',
            wsPort: 8080,
            wssPort: 443,
            forceTLS: false,
            authEndpoint: '/api/broadcasting/auth',
          },
        },
        { provide: REALTIME_CLIENT_FACTORY, useValue: factory },
      ],
    });

    service = TestBed.inject(RealtimeService);
    session = TestBed.inject(SessionStore);
    http = TestBed.inject(HttpTestingController);
    service.initialize();
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('maintains one Echo client for the authenticated session and cleans it on logout', async () => {
    expect(factory).not.toHaveBeenCalled();

    session.setSession({ id: 'user-a', name: 'A', email: 'a@example.test' }, [], [], null);
    TestBed.tick();
    await service.connect();
    await service.connect();

    expect(factory).toHaveBeenCalledOnce();
    expect(service.state()).toBe('connecting');

    connectionCallback('connected');
    expect(service.state()).toBe('connected');
    expect(service.socketId()).toBe('123.456');

    session.clearSession();
    TestBed.tick();

    expect(client.leaveAllChannels).toHaveBeenCalledOnce();
    expect(client.disconnect).toHaveBeenCalledOnce();
    expect(service.socketId()).toBeNull();
    expect(service.state()).toBe('disconnected');
  });

  it('deduplicates private and presence subscriptions and supports leave operations', async () => {
    session.setSession({ id: 'user-a', name: 'A', email: 'a@example.test' }, [], [], null);
    TestBed.tick();

    const firstPrivate = await service.private('testing.private');
    const secondPrivate = await service.private('testing.private');
    const firstPresence = await service.presence('testing.presence');
    const secondPresence = await service.join('testing.presence');

    expect(firstPrivate).toBe(secondPrivate);
    expect(firstPresence).toBe(secondPresence);
    expect(client.private).toHaveBeenCalledTimes(1);
    expect(client.join).toHaveBeenCalledTimes(1);

    service.leave('testing.private');
    expect(client.leave).toHaveBeenCalledWith('testing.private');
    service.leaveAll();
    expect(client.leaveAllChannels).toHaveBeenCalled();
  });

  it('authorizes every subscription through Angular HTTP', async () => {
    session.setSession({ id: 'user-a', name: 'A', email: 'a@example.test' }, [], [], null);
    TestBed.tick();
    await service.connect();
    const options = factory.mock.calls[0][0] as Record<string, unknown>;
    const authorizer = options['authorizer'] as (channel: { name: string }) => {
      authorize: (socketId: string, callback: (error: unknown, data: unknown) => void) => void;
    };
    const callback = vi.fn();

    authorizer({ name: 'private-testing.private' }).authorize('1.1', callback);

    const request = http.expectOne('/api/broadcasting/auth');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      socket_id: '1.1',
      channel_name: 'private-testing.private',
    });
    request.flush({ auth: 'signed-channel' });
    expect(callback).toHaveBeenCalledWith(null, { auth: 'signed-channel' });
  });

  it.each([
    ['reconnecting', 'connecting'],
    ['unavailable', 'unavailable'],
    ['failed', 'failed'],
  ] as const)('maps %s to the public %s state', async (incoming, expected) => {
    session.setSession({ id: 'user-a', name: 'A', email: 'a@example.test' }, [], [], null);
    TestBed.tick();
    await service.connect();

    connectionCallback(incoming as ConnectionStatus);

    expect(service.state()).toBe(expected);
  });
});
