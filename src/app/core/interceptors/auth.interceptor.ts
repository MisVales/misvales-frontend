import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Configuración base para enviar cookies siempre
  let headers = req.headers.set('X-Request-Id', uuidv4());

  // El token CSRF o cookies de sesión son manejadas automáticamente por el navegador
  // gracias a withCredentials: true. No guardamos tokens en localStorage (Regla 2).

  const authReq = req.clone({
    headers,
    withCredentials: true // Importante para enviar/recibir cookies en peticiones cross-origin
  });

  return next(authReq);
};
