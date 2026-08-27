import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '@core/api/api.config';
import { MeRes } from '@core/api/models/me.dtos';
import { SessionStore } from '@core/session/session.store';

@Injectable({ providedIn: 'root' })
export class MeService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly sessionStore = inject(SessionStore);

  fetchMe(): Observable<MeRes> {
    return this.http
      .get<MeRes>(`${this.config.baseUrl}/me`)
      .pipe(tap((response) => this.hydrateSession(response)));
  }

  hydrateSession(response: MeRes): void {
    const roles = Array.from(new Set(response.scopes.map((scope) => scope.role)));
    const scopes = response.scopes.map((scope) => ({
      role: scope.role,
      roleName: scope.role_name,
      branchId: scope.branch_id,
      branchName: scope.branch_name,
      branchCode: scope.branch_code,
      permissions: scope.permissions,
    }));
    const activeBranch = scopes.find((scope) => scope.branchId)?.branchId ?? null;
    const isManager = roles.includes('general_manager') || roles.includes('branch_manager');
    const isVpnHost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'vpn.safeacces.lat' ||
        window.location.hostname.startsWith('vpn.'));
    const vpn = Boolean(response.access_context?.vpn || isVpnHost);
    const managerActions = Boolean(response.capabilities?.manager_actions || (isManager && vpn));

    this.sessionStore.setSession(
      response.user,
      roles,
      response.effective_permissions,
      activeBranch,
      scopes,
      vpn,
      managerActions,
    );
  }
}
