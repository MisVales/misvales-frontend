import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { apiUrlInterceptor } from './core/interceptors/api-url.interceptor';
import { commandInterceptor } from './core/interceptors/command.interceptor';
import { correlationInterceptor } from './core/interceptors/correlation.interceptor';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { errorNormalizationInterceptor } from './core/interceptors/error-normalization.interceptor';

registerLocaleData(localeEsMx);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      }),
      withInterceptors([
        apiUrlInterceptor,
        credentialsInterceptor,
        correlationInterceptor,
        commandInterceptor,
        errorNormalizationInterceptor,
      ]),
    ),
    {
      provide: LOCALE_ID,
      useValue: 'es-MX',
    },
  ],
};
