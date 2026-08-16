import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, map, Observable, shareReplay, tap } from 'rxjs';
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
  private inFlight?: Observable<void>;

  refresh(): Observable<void> {
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.http
      .post<RefreshResponse>(
        `${this.apiConfig.baseUrl}/auth/refresh`,
        {},
        {
          headers: new HttpHeaders({ 'X-Request-Id': uuidv4() }),
          withCredentials: true,
        },
      )
      .pipe(
        tap((response) => this.tokenStore.set(response.access_token, response.expires_in)),
        map(() => undefined),
        finalize(() => {
          this.inFlight = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.inFlight;
  }
}
