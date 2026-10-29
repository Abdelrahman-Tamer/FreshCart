import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly _HttpClient = inject(HttpClient);
  private readonly _CookieService = inject(CookieService);
  private readonly platformId = inject(PLATFORM_ID);

  // Modern Angular signals for instant reactivity
  readonly wishlistIds = signal<Set<string>>(new Set());
  readonly wishlistCount = computed(() => this.wishlistIds().size);

  // BehaviorSubject for backwards compatibility with legacy observables
  private wishlistItemsSubject = new BehaviorSubject<string[]>([]);
  readonly wishlistItems$ = this.wishlistItemsSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId) && this._CookieService.get('token')) {
      this.refreshWishlist();
    }
  }

  refreshWishlist(): void {
    if (!isPlatformBrowser(this.platformId) || !this._CookieService.get('token')) {
      this.resetState();
      return;
    }
    this.getUserWishlist().subscribe({
      next: (res) => {
        if (res?.data) {
          const ids = new Set<string>(res.data.map((item: any) => item._id || item.id));
          this.wishlistIds.set(ids);
          this.wishlistItemsSubject.next(Array.from(ids));
        }
      },
      error: () => {
        this.resetState();
      }
    });
  }

  resetState(): void {
    this.wishlistIds.set(new Set());
    this.wishlistItemsSubject.next([]);
  }

  getUserWishlist(): Observable<any> {
    return this._HttpClient.get(`${environment.baseURL}/api/v1/wishlist`).pipe(
      tap((res: any) => {
        if (res?.data) {
          const ids = new Set<string>(res.data.map((item: any) => item._id || item.id));
          this.wishlistIds.set(ids);
          this.wishlistItemsSubject.next(Array.from(ids));
        }
      })
    );
  }

  addToWishlist(productId: string): Observable<any> {
    return this._HttpClient.post(`${environment.baseURL}/api/v1/wishlist`, { productId }).pipe(
      tap((res: any) => {
        const idList: string[] = res?.data || [...Array.from(this.wishlistIds()), productId];
        this.wishlistIds.set(new Set(idList));
        this.wishlistItemsSubject.next(idList);
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/wishlist/${productId}`).pipe(
      tap((res: any) => {
        const idList: string[] = res?.data || Array.from(this.wishlistIds()).filter(id => id !== productId);
        this.wishlistIds.set(new Set(idList));
        this.wishlistItemsSubject.next(idList);
      })
    );
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds().has(productId);
  }

  // Backward-compatible helper methods
  get currentWishlist(): string[] {
    return Array.from(this.wishlistIds());
  }

  addToLocalWishlist(productId: string) {
    const updated = new Set(this.wishlistIds());
    updated.add(productId);
    this.wishlistIds.set(updated);
    this.wishlistItemsSubject.next(Array.from(updated));
  }

  removeFromLocalWishlist(productId: string) {
    const updated = new Set(this.wishlistIds());
    updated.delete(productId);
    this.wishlistIds.set(updated);
    this.wishlistItemsSubject.next(Array.from(updated));
  }
}
