import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../../shared/services/Payment/payment.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {

  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _PaymentService = inject(PaymentService);
  private readonly _Router = inject(Router);
  private readonly _ToastrService = inject(ToastrService);

  isVerifying = true;
  paymentVerified = false;
  orderDetails: any = null;

  ngOnInit(): void {
    
    // Get session_id from URL parameters (Stripe redirect)
    this._ActivatedRoute.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      
      if (sessionId) {
        this.verifyPayment(sessionId);
      } else {
        // Check localStorage for session info
        const checkoutSession = localStorage.getItem('checkout_session');
        if (checkoutSession) {
          const sessionData = JSON.parse(checkoutSession);
          this.verifyPayment(sessionData.sessionId);
        } else {
          this.handleVerificationError();
        }
      }
    });
  }

  verifyPayment(sessionId: string) {
    this._PaymentService.verifyStripePayment(sessionId).subscribe({
      next: (res) => {
        this.isVerifying = false;
        if (res.status === 'success') {
          this.paymentVerified = true;
          this.orderDetails = res.order;
          
          // Clear checkout session from localStorage
          localStorage.removeItem('checkout_session');
          
          this._ToastrService.success('Payment successful! Your order has been placed.', 'Success');
          
          // Check if API response contains redirect URL
          if (res.redirectUrl && res.redirectUrl.includes('allorders')) {
          }
          
          // Redirect to orders page using Angular Router
          setTimeout(() => {
            this._Router.navigate(['/orders']);
          }, 1500);
        } else {
          this.handleVerificationError();
        }
      },
      error: (err) => {
        this.handleVerificationError();
      }
    });
  }

  handleVerificationError() {
    this.isVerifying = false;
    this.paymentVerified = false;
    this._ToastrService.error('Payment verification failed', 'Error');
    
    // Decide fallback: if user had a checkout session, send back to checkout; otherwise cart
    const hadCheckoutSession = !!localStorage.getItem('checkout_session');
    // Clear any stored session data
    localStorage.removeItem('checkout_session');

    setTimeout(() => {
      if (hadCheckoutSession) {
        this._Router.navigate(['/checkout']);
      } else {
        this._Router.navigate(['/cart']);
      }
    }, 1500);
  }

  goToOrders() {
    this._Router.navigate(['/orders']);
  }

  continueShopping() {
    this._Router.navigate(['/home']);
  }
}
