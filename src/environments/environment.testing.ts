import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  apiBaseUrl: '/api/v1',
  csrfUrl: '/sanctum/csrf-cookie',
  businessTimezone: 'America/Monterrey',
  locale: 'es-MX',
  loggingLevel: 'warn',
  sourceMaps: true,
  logPayloads: false,
};
