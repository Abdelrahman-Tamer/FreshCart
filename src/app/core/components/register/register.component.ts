import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {

  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z\s]+$/),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/)]),
      rePassword: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,20}$/)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^(\+2)?01[0125][0-9]{8}$/)]),
    },
    { validators: this.confirm }
  );

  confirm(myForm: AbstractControl) {
    if (myForm.get('password')?.value == myForm.get('rePassword')?.value) {
      return null;
    } else {
      return { missMatch: true };
    }
  }

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
            setTimeout(() => this._Router.navigate(['/login']), 1500);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  getControl(field: string) {
    return this.registerForm.get(field);
  }

  showError(field: string): string | null {
    const control = this.getControl(field);
    if (!control?.errors || (!control.touched && !control.dirty)) return null;
    if (control.errors['required']) return `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters needed`;
    if (control.errors['maxlength']) return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
    if (control.errors['email']) return 'Invalid email format';
    if (control.errors['pattern']) {
      if (field === 'phone') return 'Invalid Egyptian phone number (e.g. 010xxxxxxxx)';
      if (field === 'name') return 'Name can only contain letters and spaces';
      return 'Password must have uppercase, lowercase, digit & special char (8-20 chars)';
    }
    return null;
  }
}
