export type LoggingLevel = 'debug' | 'error' | 'warn';

export interface AppEnvironment {
  readonly production: boolean;
  readonly apiBaseUrl: '/api/v1';
  readonly csrfUrl: '/sanctum/csrf-cookie';
  readonly businessTimezone: 'America/Monterrey';
  readonly locale: 'es-MX';
  readonly loggingLevel: LoggingLevel;
  readonly sourceMaps: boolean;
  readonly logPayloads: false;
}
