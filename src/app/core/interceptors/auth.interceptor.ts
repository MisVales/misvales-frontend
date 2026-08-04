import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Configuración base para enviar cookies siempre
  let headers = req.headers.set('X-Request-Id', uuidv4());

  // (Opcional) Si la arquitectura aún requiere enviar un Bearer token desde storage
  const token = localStorage.getItem('token');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true // Importante para enviar/recibir cookies en peticiones cross-origin
  });

  return next(authReq);
};
