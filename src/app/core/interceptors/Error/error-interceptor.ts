import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../../shared/services/authentication/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  let _ToastrService = inject(ToastrService)
  let _AuthService = inject(AuthService)
  let _Router = inject(Router)

  return next(req).pipe(catchError((err) => {

    if (err.status === 401) {
      _AuthService.logOut()
      _ToastrService.error('Session expired. Please login again.', 'Unauthorized')
      if (!_Router.url.includes('/login')) {
        _Router.navigate(['/login'])
      }
    } else if (err.status === 403) {
      _ToastrService.error('You do not have permission to access this resource.', 'Access Denied')
    } else {
      const message = err?.error?.message ?? err?.message ?? 'An unexpected error occurred';
      const title = err?.error?.statusMsg ?? 'Error';
      _ToastrService.error(message, title)
    }

    return throwError(() => err)
  }))
};
