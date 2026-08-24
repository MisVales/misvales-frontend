export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  turnstileSiteKey: '1x00000000000000000000AA' as string,
  realtime: {
    enabled: true,
    appKey: 'misvales-local-web',
    wsHost: '192.168.1.106',
    wsPort: 8080,
    wssPort: 443,
    forceTLS: false,
    authEndpoint: '/api/broadcasting/auth',
  },
};
