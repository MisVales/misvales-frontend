import {
  ApplicationConfig,
  ErrorHandler,
  importProvidersFrom,
  inject,
  isDevMode,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
  withXsrfConfiguration,
} from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorHandlingInterceptor } from '@core/interceptors/error-handling.interceptor';
import { requestActivityInterceptor } from '@core/interceptors/request-activity.interceptor';
import { API_CONFIG, defaultApiConfig } from '@core/api/api.config';
import { GlobalErrorHandler } from '@core/error-handling/global-error-handler';
import { AuthConfigurationService } from '@core/auth/data-access/auth-configuration.service';
import { AccessContextRefreshService } from '@core/auth/services/access-context-refresh.service';
import { Loader2, LucideAngularModule, icons } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAppInitializer(() => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            void registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((keys) => {
            for (const key of keys) {
              if (key.includes('ngsw')) {
                void caches.delete(key);
              }
            }
          });
        }
      }
    }),
    provideAppInitializer(() => inject(AuthConfigurationService).load()),
    provideAppInitializer(() => inject(AccessContextRefreshService).start()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
    ),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([requestActivityInterceptor, authInterceptor, errorHandlingInterceptor]),
    ),
    importProvidersFrom(
      LucideAngularModule.pick({
        ...icons,
        Loader2,
      }),
    ),
    { provide: API_CONFIG, useValue: defaultApiConfig },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
