import { HttpBackend, HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { APP_CONFIG } from '@core/config/app-config.token';

@Injectable({ providedIn: 'root' })
export class CsrfService {
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly config = inject(APP_CONFIG);
  private inFlight$: Observable<void> | null = null;

  refresh(): Observable<void> {
    if (!this.inFlight$) {
      this.inFlight$ = this.http
        .get<void>(this.config.csrfUrl, {
          withCredentials: true,
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    }

    return this.inFlight$;
  }

  reset(): void {
    this.inFlight$ = null;
  }
}
