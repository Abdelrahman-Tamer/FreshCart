import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private readonly _HttpClient = inject(HttpClient);

  // Create cash order
  createCashOrder(cartId: string, shippingAddress: any): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/orders/${cartId}`, {
      shippingAddress
    });
  }

  // Create online payment session (Stripe)
  createOnlinePaymentSession(cartId: string, requestData: any): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/orders/checkout-session/${cartId}`, requestData);
  }

  // Verify Stripe payment (after successful payment)
  verifyStripePayment(sessionId: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/orders/verify-payment`, {
      sessionId
    });
  }

  // Get user orders
  getUserOrders(userId: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/orders/user/${userId}`);
  }

  // Get all orders (admin)
  getAllOrders(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/orders`);
  }

  // Get specific order
  getSpecificOrder(orderId: string): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/orders/${orderId}`);
  }

  // Update order status (admin)
  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/orders/${orderId}`, {
      status
    });
  }
}
