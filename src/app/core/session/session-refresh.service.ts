import { HttpBackend, HttpClient, HttpHeaders, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { API_CONFIG } from '../api/api.config';
import { AuthTokenStore } from './auth-token.store';

interface RefreshResponse {
  access_token: string;
  expires_in: number;
}

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly apiConfig = inject(API_CONFIG);
  private readonly tokenStore = inject(AuthTokenStore);
  private readonly xsrfTokenExtractor = inject(HttpXsrfTokenExtractor);
  private inFlight?: Observable<void>;

  refresh(): Observable<void> {
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.http
      .get(this.csrfCookieUrl(), { withCredentials: true })
      .pipe(
        switchMap(() => {
          let headers = new HttpHeaders({ 'X-Request-Id': uuidv4() });
          const csrfToken = this.xsrfTokenExtractor.getToken();

          if (csrfToken) {
            headers = headers.set('X-XSRF-TOKEN', csrfToken);
          }

          return this.http.post<RefreshResponse>(
            `${this.apiConfig.baseUrl}/auth/refresh`,
            {},
            { headers, withCredentials: true },
          );
        }),
        tap((response) => this.tokenStore.set(response.access_token, response.expires_in)),
        map(() => undefined),
        finalize(() => {
          this.inFlight = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.inFlight;
  }

  private csrfCookieUrl(): string {
    return `${this.apiConfig.baseUrl.replace(/\/api\/v1\/?$/, '')}/sanctum/csrf-cookie`;
  }
}
