import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/services/authentication/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  let _AuthService = inject(AuthService)
  let _Router = inject(Router)

  if (_AuthService.isAuthenticated()) {
    return true
  }

  _AuthService.logOut()
  return _Router.parseUrl('/not-found')
};
