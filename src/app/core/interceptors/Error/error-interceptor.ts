import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { formatApiError } from '../../utils/error-handler';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const _ToastrService = inject(ToastrService);
  const _AuthService = inject(AuthService);
  const _Router = inject(Router);

  return next(req).pipe(catchError((err) => {
    const isSignIn = req.url.toLowerCase().includes('/signin');

    // Handle session token expiry on authenticated actions
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
  }));
};
