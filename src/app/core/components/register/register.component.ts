import { Component, inject, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { formatApiError } from '../../utils/error-handler';
import { GoogleAuthService } from '../../services/google-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, AfterViewInit {

  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  readonly googleAuth = inject(GoogleAuthService);
  private readonly toastr = inject(ToastrService);

  @ViewChild('googleBtnRef') googleBtnRef?: ElementRef<HTMLDivElement>;

  isLoading = false;
  isGoogleLoading = false;
  isGoogleModalOpen = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showRePassword = false;

  customGoogleName = 'Mohamed Ali';
  customGoogleEmail = 'mohamed.freshcart@gmail.com';

  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(25),
        Validators.pattern(/^[a-zA-Z\s]+$/),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/)
      ]),
      rePassword: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(\+2)?01[0125][0-9]{8}$/)
      ]),
    },
    { validators: this.confirm }
  );

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.googleAuth.isConfigured && this.googleBtnRef?.nativeElement) {
      this.googleAuth.renderGoogleButton(
        this.googleBtnRef.nativeElement,
        (credentialResponse) => {
          this.onGoogleCredential(credentialResponse);
        },
        'signup_with'
      );
    }
  }

  confirm(myForm: AbstractControl) {
    const password = myForm.get('password')?.value;
    const rePassword = myForm.get('rePassword')?.value;
    if (!password || !rePassword) return null;
    return password === rePassword ? null : { missMatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleRePassword(): void {
    this.showRePassword = !this.showRePassword;
  }

  get nameControl() { return this.registerForm.get('name'); }
  get emailControl() { return this.registerForm.get('email'); }
  get passwordControl() { return this.registerForm.get('password'); }
  get rePasswordControl() { return this.registerForm.get('rePassword'); }
  get phoneControl() { return this.registerForm.get('phone'); }

  get passwordVal(): string {
    return this.passwordControl?.value || '';
  }
  get hasMinLength(): boolean { return this.passwordVal.length >= 8 && this.passwordVal.length <= 20; }
  get hasUpper(): boolean { return /[A-Z]/.test(this.passwordVal); }
  get hasLower(): boolean { return /[a-z]/.test(this.passwordVal); }
  get hasNumber(): boolean { return /\d/.test(this.passwordVal); }
  get hasSpecial(): boolean { return /[^a-zA-Z\d]/.test(this.passwordVal); }

  register(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this._AuthService.SignUp(this.registerForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message === "success") {
            this.successMessage = 'Account created successfully! Redirecting to login...';
            setTimeout(() => this._Router.navigate(['/login']), 1800);
          }
        },
        error: (err) => {
          this.isLoading = false;
          const formatted = formatApiError(err, '/signup');
          this.errorMessage = formatted.message;
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  handleGoogleSignUpClick(): void {
    if (this.googleAuth.isConfigured) {
      this.googleAuth.initGoogleId((credentialResponse) => {
        this.onGoogleCredential(credentialResponse);
      });
    } else {
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
        this.toastr.success(`Account ready! Signed in as ${profile.name}`, 'Google Sign-Up', {
          timeOut: 2500,
          closeButton: true,
          progressBar: true
        });
        this._Router.navigateByUrl('/home');
      },
      error: (err: any) => {
        this.isGoogleLoading = false;
        if (err?.code === 'ACCOUNT_EXISTS_WITH_PASSWORD') {
          if (profile.picture) {
            localStorage.setItem('user_avatar', profile.picture);
          }
          this.toastr.info(
            `An account for ${err.email} already exists. Please sign in with your password.`,
            'Account Exists',
            { timeOut: 4000, closeButton: true, progressBar: true }
          );
          this._Router.navigate(['/login']);
        } else {
          this.errorMessage = err?.message || 'Google authentication encountered an error. Please try again.';
        }
      }
    });
  }

  closeGoogleModal(): void {
    this.isGoogleModalOpen = false;
  }
}
