import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  apiBaseUrl: '/api/v1',
  csrfUrl: '/sanctum/csrf-cookie',
  businessTimezone: 'America/Monterrey',
  locale: 'es-MX',
  loggingLevel: 'error',
  sourceMaps: false,
  logPayloads: false,
};
