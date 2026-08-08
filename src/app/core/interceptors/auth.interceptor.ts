import { HttpInterceptorFn } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let headers = req.headers.set('X-Request-Id', uuidv4());

  const token = Cookies.get('access_token');
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true
  });

  return next(authReq);
};
