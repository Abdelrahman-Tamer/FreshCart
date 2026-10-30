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

  private isRefreshing = false;
  private lastFetched = 0;

  constructor() {
    if (isPlatformBrowser(this.platformId) && this._CookieService.get('token')) {
      this.refreshWishlist();
    }
  }

  refreshWishlist(force = false): void {
    if (!isPlatformBrowser(this.platformId) || !this._CookieService.get('token')) {
      this.resetState();
      return;
    }
    const now = Date.now();
    // Cache for 20 seconds unless forced, avoiding excessive API hammering on route switches
    if (!force && this.wishlistIds().size > 0 && (now - this.lastFetched < 20000)) {
      return;
    }
    if (this.isRefreshing) {
      return;
    }
    this.isRefreshing = true;
    this.getUserWishlist(true).subscribe({
      next: (res) => {
        this.isRefreshing = false;
        this.lastFetched = Date.now();
        if (res?.data) {
          const ids = new Set<string>(res.data.map((item: any) => item._id || item.id));
          this.wishlistIds.set(ids);
          this.wishlistItemsSubject.next(Array.from(ids));
        }
      },
      error: () => {
        this.isRefreshing = false;
      }
    });
  }

  resetState(): void {
    this.wishlistIds.set(new Set());
    this.wishlistItemsSubject.next([]);
    this.lastFetched = 0;
  }

  getUserWishlist(silent = false): Observable<any> {
    const headers = silent ? { 'X-Silent-Error': 'true' } : undefined;
    return this._HttpClient.get(`${environment.baseURL}/api/v1/wishlist`, { headers }).pipe(
      tap((res: any) => {
        if (res?.data) {
          const ids = new Set<string>(res.data.map((item: any) => item._id || item.id));
          this.wishlistIds.set(ids);
          this.wishlistItemsSubject.next(Array.from(ids));
          this.lastFetched = Date.now();
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
        this.lastFetched = Date.now();
      })
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/wishlist/${productId}`).pipe(
      tap((res: any) => {
        const idList: string[] = res?.data || Array.from(this.wishlistIds()).filter(id => id !== productId);
        this.wishlistIds.set(new Set(idList));
        this.wishlistItemsSubject.next(idList);
        this.lastFetched = Date.now();
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
