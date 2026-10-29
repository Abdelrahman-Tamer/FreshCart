import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  
  wishlistItems: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  imageErrors: Set<string> = new Set();

  private readonly _WishlistService = inject(WishlistService);
  private readonly _CartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.error = null;

    this._WishlistService.getUserWishlist().subscribe({
      next: (res) => {
        this.wishlistItems = res?.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load wishlist items';
        this.isLoading = false;
      }
    });
  }

  removeFromWishlist(productId: string): void {
    this._WishlistService.removeFromWishlist(productId).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(item => (item._id || item.id) !== productId);
        this.toastr.success('Removed from wishlist', 'Wishlist');
      },
      error: () => {
        this.toastr.error('Failed to remove from wishlist', 'Error');
      }
    });
  }

  addToCart(productId: string): void {
    this._CartService.AddProductToCart(productId).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Product added to cart', 'Success', {
          timeOut: 3000,
          closeButton: true,
          progressBar: true
        });
      },
      error: () => {
        this.toastr.error('Failed to add to cart', 'Error');
      }
    });
  }

  onImageError(event: any, productId: string): void {
    this.imageErrors.add(productId);
    event.target.style.display = 'none';
  }

  isImageError(productId: string): boolean {
    return this.imageErrors.has(productId);
  }

  clearWishlist(): void {
    // Sequentially or parallel remove items
    const itemsToRemove = [...this.wishlistItems];
    itemsToRemove.forEach((item) => {
      const id = item._id || item.id;
      this._WishlistService.removeFromWishlist(id).subscribe();
    });
    this.wishlistItems = [];
    this.toastr.info('Wishlist cleared', 'Wishlist');
  }
}
