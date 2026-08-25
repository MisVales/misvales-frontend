import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { firstValueFrom, filter } from 'rxjs';
import { MeService } from '../data-access/me.service';
import { SessionStore } from '@core/session/session.store';

@Injectable({ providedIn: 'root' })
export class AccessContextRefreshService {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly me = inject(MeService);
  private readonly session = inject(SessionStore);
  private refreshing = false;
  private lastRefreshedAt = 0;
  private readonly MIN_REFRESH_INTERVAL_MS = 10_000;

  constructor() {
    effect(() => {
      const roles = this.session.roles();
      const isManager = roles.includes('general_manager') || roles.includes('branch_manager');
      const isVpnHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'vpn.safeacces.lat' ||
          window.location.hostname.startsWith('vpn.'));
      const hasVpnAccess =
        Boolean(this.session.managerActions?.()) ||
        Boolean(this.session.vpn?.()) ||
        isVpnHost;
      this.document.body.classList.toggle(
        'manager-actions-disabled',
        isManager && !hasVpnAccess,
      );
    });
  }

  start(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      void this.refresh(true);
    });
    this.document.defaultView?.addEventListener('focus', () => void this.refresh());
    this.document.addEventListener('visibilitychange', () => {
      if (this.document.visibilityState === 'visible') void this.refresh();
    });
  }

  async refresh(force = false): Promise<void> {
    if (!this.session.isAuthenticated() || this.refreshing) return;
    const now = Date.now();
    if (!force && now - this.lastRefreshedAt < this.MIN_REFRESH_INTERVAL_MS) return;

    this.refreshing = true;
    this.lastRefreshedAt = now;
    try {
      await firstValueFrom(this.me.fetchMe());
    } catch {
      // El interceptor conserva o finaliza la sesión según el estado HTTP real.
    } finally {
      this.refreshing = false;
    }
  }
}
