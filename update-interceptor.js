const fs = require('fs');
let code = fs.readFileSync('src/app/core/interceptors/error-handling.interceptor.ts', 'utf8');

if (!code.includes('OfflineSyncService')) {
  code = code.replace(
    'import { SessionStore } from \'../session/session.store\';',
    'import { SessionStore } from \'../session/session.store\';\nimport { OfflineSyncService } from \'../services/offline-sync.service\';'
  );
  
  code = code.replace(
    'const router = inject(Router);',
    'const router = inject(Router);\n  const offlineSync = inject(OfflineSyncService);'
  );
  
  const offlineCheck =     } else if (error.status === 0) {
      if (request.headers.has('X-Autosave')) {
        let headersObj = {};
        request.headers.keys().forEach(key => {
          headersObj[key] = request.headers.getAll(key);
        });
        offlineSync.saveRequest(request.urlWithParams, request.method, request.body, headersObj).then(() => {
          alertService.showAlert('Sin conexión. Cambios guardados localmente.', 'warning', 5000);
        });
        return throwError(() => error);
      }
      alertService.showAlert(
        'No fue posible conectar con el servidor. Tus cambios actuales continúan en pantalla.',
        'error',
        7000,
      );;
      
  code = code.replace(
    /    \} else if \(error\.status === 0\) \{\s+alertService\.showAlert\(\s+'No fue posible conectar con el servidor\. Tus cambios actuales continúan en pantalla\.',\s+'error',\s+7000,\s+\);\s+\}/g,
    offlineCheck
  );
  
  fs.writeFileSync('src/app/core/interceptors/error-handling.interceptor.ts', code);
  console.log('error-handling.interceptor.ts updated for offline sync');
} else {
  console.log('Already updated');
}
