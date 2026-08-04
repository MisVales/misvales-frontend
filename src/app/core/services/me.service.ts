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
    return this.http.get<MeRes>(`${this.config.baseUrl}/me`).pipe(
      tap((res) => {
        const roles = res.scopes.map(s => s.role);
        const activeBranch = res.scopes.find(s => s.branch_id)?.branch_id || null;
        
        this.sessionStore.setSession(
          { id: res.user.id, name: res.user.name, email: res.user.email },
          roles,
          res.effective_permissions,
          activeBranch,
          res.user.layoutPreference || 'desktop'
        );
      })
    );
  }
}
