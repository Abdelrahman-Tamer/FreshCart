import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, retry, throwError, timer } from 'rxjs';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { formatApiError } from '../../utils/error-handler';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const _ToastrService = inject(ToastrService);
  const _AuthService = inject(AuthService);
  const _Router = inject(Router);

  return next(req).pipe(
    // Transient error retry for safe GET requests (handles momentary 500/502/503/504 server hiccups)
    retry({
      count: 1,
      delay: (error) => {
        if (req.method === 'GET' && error.status >= 500 && error.status <= 504) {
          return timer(600);
        }
        return throwError(() => error);
      }
    }),
    catchError((err) => {
      // 1. Silent background requests (e.g., background badge counters) should not show intrusive toasts
      const isSilent = req.headers.has('X-Silent-Error') || req.headers.has('x-silent-error');
      if (isSilent) {
        return throwError(() => err);
      }

      const isSignIn = req.url.toLowerCase().includes('/signin');

      // 2. Handle session token expiry on authenticated actions
      if (err.status === 401 && !isSignIn) {
        _AuthService.logOut();
        _ToastrService.error('Your session has expired. Please sign in again to continue.', 'Session Expired');
        if (!_Router.url.includes('/login')) {
          _Router.navigate(['/login']);
        }
      } else {
        const { title, message } = formatApiError(err, req.url);
        _ToastrService.error(message, title);
      }

      return throwError(() => err);
    })
  );
};
