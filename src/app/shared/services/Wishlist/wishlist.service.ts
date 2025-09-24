import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private readonly _HttpClient = inject(HttpClient);

  // BehaviorSubject to track wishlist items
  private wishlistItems = new BehaviorSubject<string[]>([]);
  wishlistItems$ = this.wishlistItems.asObservable();

  // Getter for current value
  get currentWishlist(): string[] {
    return this.wishlistItems.value;
  }

  constructor() {
    // Load wishlist from localStorage on service initialization
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        this.wishlistItems.next(JSON.parse(savedWishlist));
      }
    }
  }

  // Add product to wishlist
  addToWishlist(productId: string): Observable<any> {
    return this._HttpClient.patch(`${environment.baseURL}/api/v1/wishlist`, {
      productId: productId
    });
  }

  // Remove product from wishlist
  removeFromWishlist(productId: string): Observable<any> {
    return this._HttpClient.delete(`${environment.baseURL}/api/v1/wishlist/${productId}`);
  }

  // Get user's wishlist
  getUserWishlist(): Observable<any> {
    // For now, return local wishlist since API endpoint is not available
    return new Observable(observer => {
      const localWishlist = this.wishlistItems.value;
      observer.next({
        success: true,
        data: localWishlist.map(id => ({ _id: id }))
      });
      observer.complete();
    });
  }

  // Local methods for UI state management
  addToLocalWishlist(productId: string) {
    const currentWishlist = this.currentWishlist;
    if (!currentWishlist.includes(productId)) {
      const updatedWishlist = [...currentWishlist, productId];
      this.wishlistItems.next(updatedWishlist);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      }
    }
  }

  removeFromLocalWishlist(productId: string) {
    const currentWishlist = this.currentWishlist;
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    this.wishlistItems.next(updatedWishlist);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    }
  }

  isInWishlist(productId: string): boolean {
    return this.currentWishlist.includes(productId);
  }

  getWishlistCount(): number {
    return this.currentWishlist.length;
  }

  // Toggle wishlist item (add if not exists, remove if exists)
  toggleWishlistItem(productId: string): Observable<any> {
    // For now, just use local storage since API endpoints are not available
    if (this.isInWishlist(productId)) {
      this.removeFromLocalWishlist(productId);
    } else {
      this.addToLocalWishlist(productId);
    }

    // Return a mock observable that always succeeds
    return new Observable(observer => {
      observer.next({ success: true, message: 'Wishlist updated' });
      observer.complete();
    });
  }
}
