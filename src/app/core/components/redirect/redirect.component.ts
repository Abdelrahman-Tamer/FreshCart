import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/authentication/auth.service';

@Component({
  selector: 'app-redirect',
  template: '',
  standalone: true,
})
export class RedirectComponent implements OnInit {
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  ngOnInit() {
    if (this._AuthService.isAuthenticated()) {
      this._Router.navigate(['/home']);
    } else {
      this._Router.navigate(['/login']);
    }
  }
}
