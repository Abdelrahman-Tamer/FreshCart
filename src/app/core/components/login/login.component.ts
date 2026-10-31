import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule } from '@angular/common';
import { formatApiError } from '../../utils/error-handler';
import { GoogleAuthService, GoogleUserProfile } from '../../services/google-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _CookieService = inject(CookieService);
  private readonly _Router = inject(Router);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  readonly googleAuth = inject(GoogleAuthService);
  private readonly toastr = inject(ToastrService);

  isLoading = false;
  isGoogleLoading = false;
  isGoogleModalOpen = false;
  errorMessage = '';
  showPassword = false;

  // Quick account options for development / preview mode
  customGoogleName = 'Mohamed Ali';
  customGoogleEmail = 'mohamed.freshcart@gmail.com';

  loginForm: FormGroup = this._FormBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    if (this.googleAuth.isConfigured) {
      this.googleAuth.initGoogleId((credentialResponse) => {
        this.onGoogleCredential(credentialResponse);
      });
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  login() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this._AuthService.SignIn(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message === "success") {
            this._CookieService.set('token', res.token, { path: '/', sameSite: 'Lax' });
            if (this._CookieService.get('token')) {
              this._AuthService.decodeToken();
              this._AuthService.updateLoginStatus(true);
            }
            const returnUrl = this._ActivatedRoute.snapshot.queryParams['returnUrl'] || '/home';
            this._Router.navigateByUrl(returnUrl);
          }
        },
        error: (err) => {
          this.isLoading = false;
          const formatted = formatApiError(err, '/signin');
          this.errorMessage = formatted.message;
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  handleGoogleSignInClick(): void {
    if (this.googleAuth.isConfigured) {
      // Trigger official Google One Tap or prompt
      this.googleAuth.initGoogleId((credentialResponse) => {
        this.onGoogleCredential(credentialResponse);
      });
    } else {
      // Open instant Google account selector dialog
      this.isGoogleModalOpen = true;
    }
  }

  onGoogleCredential(credentialResponse: any): void {
    if (credentialResponse?.credential) {
      const profile = this.googleAuth.decodeGoogleCredential(credentialResponse.credential);
      if (profile) {
        this.authenticateWithGoogleProfile({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          sub: profile.sub
        });
      }
    }
  }

  authenticateWithGoogleProfile(profile: { name: string; email: string; picture?: string; sub: string }): void {
    this.isGoogleLoading = true;
    this.errorMessage = '';
    this._AuthService.loginWithGoogle(profile).subscribe({
      next: () => {
        this.isGoogleLoading = false;
        this.isGoogleModalOpen = false;
        this.toastr.success(`Signed in as ${profile.name}`, 'Google Sign-In Successful', {
          timeOut: 2500,
          closeButton: true,
          progressBar: true
        });
        const returnUrl = this._ActivatedRoute.snapshot.queryParams['returnUrl'] || '/home';
        this._Router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.isGoogleLoading = false;
        this.errorMessage = 'Google authentication encountered an error. Please try again.';
      }
    });
  }

  closeGoogleModal(): void {
    this.isGoogleModalOpen = false;
  }
}
