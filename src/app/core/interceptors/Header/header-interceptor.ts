import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/environment';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const cookieService = inject(CookieService);

  // Only attach auth headers to requests aimed at our backend API
  const isApiRequest = req.url.startsWith(environment.baseURL);
  const isAuthEndpoint = req.url.includes('/api/v1/auth/');

  if (!isApiRequest || isAuthEndpoint) {
    return next(req);
  }

  if (isPlatformBrowser(platformId)) {
    const token = cookieService.get('token');
    if (token) {
      req = req.clone({
        setHeaders: { token }
      });
    }
  }

  return next(req);
};
