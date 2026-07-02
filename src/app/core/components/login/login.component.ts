import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly _FormBuilder = inject(FormBuilder)
  private readonly _AuthService = inject(AuthService)
  private readonly _CookieService = inject(CookieService)
  private readonly _Router = inject(Router)

  isLoading = false;
  errorMessage = '';

  loginForm: FormGroup = this._FormBuilder.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/)]]
  })

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this._AuthService.SignIn(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message === "success") {
            this._CookieService.set('token', res.token);
            if (this._CookieService.get('token')) {
              this._AuthService.decodeToken();
              this._AuthService.updateLoginStatus(true);
            }
            this._Router.navigate(['/home']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    }
  }
}
