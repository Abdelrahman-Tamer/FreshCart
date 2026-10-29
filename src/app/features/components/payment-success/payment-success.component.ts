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
    // Read session_id from URL parameters
    this._ActivatedRoute.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      
      if (sessionId) {
        this.verifyPayment(sessionId);
      } else {
        this.handleVerificationError();
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
          
          this._ToastrService.success('Payment confirmed! Your order has been placed.', 'Success');
          
          // Redirect to orders page after short confirmation
          setTimeout(() => {
            this._Router.navigate(['/orders']);
          }, 1500);
        } else {
          this.handleVerificationError();
        }
      },
      error: () => {
        this.handleVerificationError();
      }
    });
  }

  handleVerificationError() {
    this.isVerifying = false;
    this.paymentVerified = false;
    this._ToastrService.error('Could not verify transaction status', 'Verification Notice');
  }

  goToOrders() {
    this._Router.navigate(['/orders']);
  }

  continueShopping() {
    this._Router.navigate(['/home']);
  }
}
