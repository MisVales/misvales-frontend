import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Configuración base para enviar cookies siempre
  let headers = req.headers.set('X-Request-Id', uuidv4());

  // Extraer token CSRF manualmente porque Angular no lo envía en peticiones cross-origin absolutas
  const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
  if (match && match[3]) {
    const token = decodeURIComponent(match[3]);
    headers = headers.set('X-XSRF-TOKEN', token);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true // Importante para enviar/recibir cookies en peticiones cross-origin
  });

  return next(authReq);
};
