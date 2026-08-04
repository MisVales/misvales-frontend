import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler, Injectable } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorHandlingInterceptor } from '@core/interceptors/error-handling.interceptor';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    console.error('GLOBAL ERROR:', error);
    document.body.innerHTML = `<div style="color:red; padding:20px; font-family:monospace; background:white; position:fixed; top:0; left:0; right:0; z-index:9999; word-break: break-all;">
      <h2>Application Error</h2>
      <pre>${error.message || error.toString()}</pre>
      <pre>${error.stack || ''}</pre>
    </div>`;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        errorHandlingInterceptor
      ])
    ),
    { provide: API_CONFIG, useValue: defaultApiConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};