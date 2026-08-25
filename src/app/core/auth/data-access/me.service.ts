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
    return this.http.get<MeRes>(`${this.config.baseUrl}/me`).pipe(
      tap((response) => {
        const roles = Array.from(new Set(response.scopes.map((scope) => scope.role)));
        const scopes = response.scopes.map((scope) => ({
          role: scope.role,
          roleName: scope.role_name,
          branchId: scope.branch_id,
          permissions: scope.permissions,
        }));
        const activeBranch = scopes.find((scope) => scope.branchId)?.branchId ?? null;

        this.sessionStore.setSession(
          response.user,
          roles,
          response.effective_permissions,
          activeBranch,
          scopes,
          response.access_context.vpn,
          response.capabilities.manager_actions,
        );
      }),
    );
  }
}
