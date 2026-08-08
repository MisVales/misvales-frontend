import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api/api.config';
import { MeRes } from '../api/models/me.dtos';
import { Observable, tap } from 'rxjs';
import { SessionStore } from '../session/session.store';

@Injectable({
  providedIn: 'root'
})
export class MeService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);
  private readonly sessionStore = inject(SessionStore);

  fetchMe(): Observable<MeRes> {
    return this.http.get<any>(`${this.config.baseUrl}/me`).pipe(
      tap((res: any) => {
        // Map backend response to frontend MeRes
        const mappedRes: MeRes = {
          user: {
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            status: res.user.state,
            layoutPreference: 'desktop'
          },
          scopes: res.scopes.map((s: any) => ({
            branchId: s.branch_id,
            branchName: s.role_name, // Backend provides role_name, using as fallback or adjust later
            role: s.role
          })),
          effective_permissions: res.effective_permissions,
          activeBranch: undefined
        };

        const roles = Array.from(new Set(mappedRes.scopes.map(s => s.role)));
        this.sessionStore.setSession(
          { id: mappedRes.user.id, name: mappedRes.user.name, email: mappedRes.user.email },
          roles,
          mappedRes.effective_permissions,
          mappedRes.activeBranch || null,
          mappedRes.user.layoutPreference,
          mappedRes.scopes
        );
      })
    );
  }
}
