import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);

  // Component state
  currentStep = 1; // 1: Email, 2: Code, 3: New Password
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userEmail = '';
  showNewPassword = false;
  showConfirmPassword = false;

  // Form for email step
  emailForm: FormGroup = this._FormBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  // Form for code verification step
  codeForm: FormGroup = this._FormBuilder.group({
    resetCode: ['', [Validators.required, Validators.minLength(4)]]
  });

  // Form for new password step
  passwordForm: FormGroup = this._FormBuilder.group({
    email: [''],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Custom validator for password match
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Step 1: Send reset code to email
  sendResetCode() {
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      this.userEmail = this.emailForm.get('email')?.value;

      this._AuthService.forgotPassword(this.emailForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.message && res.message.includes('Reset code sent')) {
            this.successMessage = 'Reset code sent to your email successfully!';
            this.currentStep = 2;
          } else {
            this.errorMessage = res.message || 'Failed to send reset code. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
      });
    } else {
      this.emailForm.markAllAsTouched();
    }
  }

  // Step 2: Verify reset code
  verifyCode() {
    if (this.codeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const codeData = {
        email: this.userEmail,
        resetCode: String(this.codeForm.get('resetCode')?.value || '').trim()
      };

      this._AuthService.verifyResetCode(codeData).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && !res.message?.toLowerCase().includes('invalid') && !res.message?.toLowerCase().includes('error')) {
            this.successMessage = 'Code verified successfully!';
            this.currentStep = 3;
            this.passwordForm.patchValue({ email: this.userEmail });
          } else if (res && res.status === 'success') {
            this.successMessage = 'Code verified successfully!';
            this.currentStep = 3;
            this.passwordForm.patchValue({ email: this.userEmail });
          } else {
            this.errorMessage = res.message || 'Invalid code. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Invalid code. Please try again.';
        }
      });
    } else {
      this.codeForm.markAllAsTouched();
    }
  }

  // Step 3: Reset password
  resetPassword() {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const resetData = {
        email: this.userEmail,
        newPassword: this.passwordForm.get('newPassword')?.value
      };

      this._AuthService.resetPassword(resetData).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res && !res.message?.toLowerCase().includes('failed') && !res.message?.toLowerCase().includes('error')) {
            this.successMessage = 'Password reset successfully! Redirecting to login...';
            setTimeout(() => {
              this._Router.navigate(['/login']);
            }, 1800);
          } else if (res && res.status === 'success') {
            this.successMessage = 'Password reset successfully! Redirecting to login...';
            setTimeout(() => {
              this._Router.navigate(['/login']);
            }, 1800);
          } else {
            this.errorMessage = res.message || 'Failed to reset password. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        }
      });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  // Go back to previous step
  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  // Get field error message
  getFieldError(formName: string, fieldName: string): string {
    const form = (this as any)[formName] as FormGroup;
    const field = form.get(fieldName);
    
    if (field?.errors && (field.touched || field.dirty)) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    
    if (formName === 'passwordForm' && form.errors?.['passwordMismatch'] && (field?.touched || field?.dirty)) {
      return 'Passwords do not match';
    }
    
    return '';
  }
}
