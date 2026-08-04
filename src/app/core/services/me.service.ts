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
    return this.http.get<MeRes>(`${this.config.baseUrl}/v1/me`).pipe(
      tap((res) => {
        this.sessionStore.setSession(
          { id: res.id, name: res.name, email: res.email },
          res.roles,
          res.permissions,
          res.activeBranch || null,
          res.layoutPreference
        );
      })
    );
  }
}
