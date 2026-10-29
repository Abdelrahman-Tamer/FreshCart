import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _CookieService = inject(CookieService);
  private readonly platformId = inject(PLATFORM_ID);

  // Modern reactive signals for cart state across the app
  readonly cartCount = signal<number>(0);
  readonly cartTotal = signal<number>(0);
  readonly cartId = signal<string>('');

  constructor() {
    if (isPlatformBrowser(this.platformId) && this._CookieService.get('token')) {
      this.refreshCart();
    }
  }

  refreshCart(): void {
    if (!isPlatformBrowser(this.platformId) || !this._CookieService.get('token')) {
      this.resetState();
      return;
    }
    this.GetLoggedUserCart().subscribe({
      next: (res) => {
        if (res?.data) {
          this.cartCount.set(res.numOfCartItems ?? res.data.products?.length ?? 0);
          this.cartTotal.set(res.data.totalCartPrice ?? 0);
          this.cartId.set(res.cartId ?? res.data._id ?? '');
        }
      },
      error: () => {
        this.resetState();
      }
    });
  }

  resetState(): void {
    this.cartCount.set(0);
    this.cartTotal.set(0);
    this.cartId.set('');
  }

  GetLoggedUserCart(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/cart`).pipe(
      tap((res: any) => {
        if (res?.data) {
          this.cartCount.set(res.numOfCartItems ?? res.data.products?.length ?? 0);
          this.cartTotal.set(res.data.totalCartPrice ?? 0);
          this.cartId.set(res.cartId ?? res.data._id ?? '');
        }
      })
    );
  }

  AddProductToCart(p_id: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/cart`, { productId: p_id }).pipe(
      tap((res: any) => {
        if (typeof res?.numOfCartItems === 'number') {
          this.cartCount.set(res.numOfCartItems);
        } else if (res?.data?.products) {
          this.cartCount.set(res.data.products.length);
        }
        if (res?.data?.totalCartPrice) {
          this.cartTotal.set(res.data.totalCartPrice);
        }
        if (res?.cartId || res?.data?._id) {
          this.cartId.set(res.cartId || res.data._id);
        }
      })
    );
  }

  UpdateCartProductQuantity(p_id: string, count: number): Observable<any> {
    return this._HttpClient.put(`${environment.baseURL}/api/v1/cart/${p_id}`, { count }).pipe(
      tap((res: any) => {
        if (typeof res?.numOfCartItems === 'number') {
          this.cartCount.set(res.numOfCartItems);
        }
        if (res?.data?.totalCartPrice) {
          this.cartTotal.set(res.data.totalCartPrice);
        }
      })
    );
  }

  RemovespecifiCartItem(p_id: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/cart/${p_id}`).pipe(
      tap((res: any) => {
        if (typeof res?.numOfCartItems === 'number') {
          this.cartCount.set(res.numOfCartItems);
        }
        if (res?.data?.totalCartPrice !== undefined) {
          this.cartTotal.set(res.data.totalCartPrice);
        }
      })
    );
  }

  ClearCart(): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/cart`).pipe(
      tap(() => {
        this.resetState();
      })
    );
  }
}
