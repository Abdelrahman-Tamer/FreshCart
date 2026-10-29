import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showRePassword = false;

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

  // Password checklist helpers
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
          this.errorMessage = err.error?.message || 'Registration failed. Please verify your details.';
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
