import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
import { MeRes } from '../api/models/me.dtos';
import { SessionStore } from '../session/session.store';

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
          response.user.layoutPreference,
          scopes,
        );
      }),
    );
  }
}
