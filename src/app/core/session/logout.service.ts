import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { internalApiContext } from '@core/api/api-request.context';

import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class LogoutService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = inject(SessionStore);

  logout(): Observable<void> {
    return this.http.post<void>('/auth/logout', {}, { context: internalApiContext() }).pipe(
      tap(() => {
        this.session.clear();
        void this.router.navigate(['/acceso']);
      }),
    );
  }
}
