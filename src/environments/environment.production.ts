export const environment = {
  production: true,
  apiBaseUrl: '/api/v1',
  turnstileSiteKey: '',
  realtime: {
    enabled: true,
    appKey: 'misvales-web',
    wsHost: window.location.hostname,
    wsPort: 80,
    wssPort: 443,
    forceTLS: true,
    authEndpoint: '/api/broadcasting/auth',
  },
};
