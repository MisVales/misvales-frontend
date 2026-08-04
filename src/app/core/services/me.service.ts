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
    // MOCK ME ENDPOINT
    return new Observable<MeRes>(observer => {
      setTimeout(() => {
        const mockRes: MeRes = {
          id: '1',
          name: 'Administrador Demo',
          email: 'admin@demo.com',
          roles: ['admin'],
          permissions: ['users.view', 'users.create', 'roles.view', 'all'],
          activeBranch: undefined,
          layoutPreference: 'desktop'
        };
        this.sessionStore.setSession(
          { id: mockRes.id, name: mockRes.name, email: mockRes.email },
          mockRes.roles,
          mockRes.permissions,
          mockRes.activeBranch || null,
          mockRes.layoutPreference
        );
        observer.next(mockRes);
        observer.complete();
      }, 500);
    });
  }
}
