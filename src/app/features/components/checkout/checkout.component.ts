import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { PaymentService } from '../../../shared/services/Payment/payment.service';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { ICart } from '../../../core/interfaces/icart.interface';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private readonly baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'https://freshcart.vercel.app';

  private readonly _FormBuilder = inject(FormBuilder);
  private readonly _CartService = inject(CartService);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _ToastrService = inject(ToastrService);

  cartData!: ICart;
  isLoading = false;
  isProcessingPayment = false;
  paymentMethod = 'cash'; // 'cash' or 'online'

  checkoutForm: FormGroup = this._FormBuilder.group({
    details: [null, [Validators.required, Validators.minLength(10)]],
    phone: [null, [Validators.required, Validators.pattern(/^(\+2)?01[0125][0-9]{8}$/)]],
    city: [null, [Validators.required, Validators.minLength(2)]]
  });

  ngOnInit(): void {
    this.loadCartData();
    
    // Check if user returned from canceled payment
    this._ActivatedRoute.queryParams.subscribe(params => {
      if (params['canceled'] === 'true') {
        this._ToastrService.warning('Payment was canceled. You can try again.', 'Payment Canceled');
      }
    });
  }

  loadCartData() {
    this.isLoading = true;
    this._CartService.GetLoggedUserCart().subscribe({
      next: (res: any) => { 
        this.cartData = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this._ToastrService.error('Failed to load cart data', 'Error');
        this._Router.navigate(['/cart']);
      }
    });
  }

  selectPaymentMethod(method: string) {
    this.paymentMethod = method;
  }

  processOrder() {
    if (this.checkoutForm.valid && this.cartData && !this.isProcessingPayment) {
      this.isProcessingPayment = true;
      const shippingAddress = this.checkoutForm.value;

      if (this.paymentMethod === 'cash') {
        // Process cash on delivery order
        this._PaymentService.createCashOrder(this.cartData._id, shippingAddress).subscribe({
          next: (res) => {
            this.isProcessingPayment = false;
            this._CartService.resetState();
            this._ToastrService.success('Order placed successfully!', 'Success');
            this._Router.navigate(['/orders']);
          },
          error: (err) => {
            this.isProcessingPayment = false;
            this._ToastrService.error('Failed to place order', 'Error');
            console.error('Cash order error:', err);
          }
        });
      } else {
        // Process online payment via Stripe
        const baseUrl = this.baseUrl;
        const requestBody = {
          shippingAddress
        };

        this._PaymentService.createOnlinePaymentSession(this.cartData._id, requestBody, baseUrl).subscribe({
          next: (res: any) => {
            this.isProcessingPayment = false;
            
            // Extract Stripe Checkout URL
            let stripeUrl: string | null = null;
            if (res.session && res.session.url) {
              stripeUrl = res.session.url;
            } else if (res.url) {
              stripeUrl = res.url;
            } else if (res.data && res.data.url) {
              stripeUrl = res.data.url;
            }
            
            if (stripeUrl) {
              this._ToastrService.info('Redirecting to Stripe payment...', 'Payment', {
                timeOut: 2000,
                closeButton: true
              });
              
              setTimeout(() => {
                window.location.href = stripeUrl!;
              }, 1000);
            } else {
              console.error('No redirect URL in response:', res);
              this._ToastrService.error('Payment session failed - no redirect URL received', 'Error');
            }
          },
          error: (err) => {
            this.isProcessingPayment = false;
            this._ToastrService.error('Failed to create payment session', 'Error');
            console.error('Payment session error:', err);
          }
        });
      }
    } else {
      // Mark all fields as touched to display validation errors
      Object.keys(this.checkoutForm.controls).forEach(key => {
        this.checkoutForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      if (field.errors['minlength']) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is too short`;
      if (field.errors['pattern']) return 'Please enter a valid Egyptian phone number';
    }
    return '';
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field?.valid && field.touched);
  }

}
