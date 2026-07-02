import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {

  let _CookieService = inject(CookieService)

  // Skip auth endpoints (signup, signin, forgot-password, reset-password)
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  const token = _CookieService.get('token');
  if (token) {
    req = req.clone({
      setHeaders: { token }
    })
  }




  return next(req);
};
