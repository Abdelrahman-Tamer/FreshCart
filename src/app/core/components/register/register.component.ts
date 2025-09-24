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
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  // Validators

  private readonly _AuthService = inject(AuthService)
  private readonly _Router = inject(Router)


  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10),
      ]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.pattern(/^\w{6,20}$/)]),
      rePassword: new FormControl(null, [Validators.required, Validators.pattern(/^\w{6,20}$/)]),
      phone: new FormControl(null, [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]),
    },
    { validators: this.confirm}
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
      this._AuthService.SignUp(this.registerForm.value).subscribe({
        next:(res)=>{
          if(res.message === "success"){
            // Programming routing
            this._Router.navigate(['/login'])
          }
        },
        error:(err)=>{
          
        }
      })

    }
  }
}
