import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { ProductsService } from '../../../shared/services/Products/products.service';
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

  private _WishlistService = inject(WishlistService);
  private _ProductsService = inject(ProductsService);
  private _CartService = inject(CartService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.error = null;
    
    // Subscribe to wishlist changes
    this._WishlistService.wishlistItems$.subscribe(localWishlist => {
      if (localWishlist.length === 0) {
        this.wishlistItems = [];
        this.isLoading = false;
        return;
      }

      // Load product details for each wishlist item
      this._ProductsService.getAllProducts().subscribe({
        next: (response) => {
          const allProducts = response.data || response;
          this.wishlistItems = allProducts.filter((product: any) => 
            localWishlist.includes(product._id)
          );
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load wishlist items';
          this.isLoading = false;
          console.error('Error loading wishlist:', err);
        }
      });
    });
  }

  removeFromWishlist(productId: string): void {
    this._WishlistService.removeFromLocalWishlist(productId);
    this.wishlistItems = this.wishlistItems.filter(item => item._id !== productId);
    this.toastr.success('Removed from wishlist', 'Wishlist');
  }

  addToCart(productId: string): void {
    this._CartService.AddProductToCart(productId).subscribe({
      next: (res) => {
        this.toastr.success(res.message, res.status, {
          timeOut: 3000,
          closeButton: true,
          progressBar: true,
          positionClass: 'toast-top-right'
        });
      },
      error: (err) => {
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
    // Clear all items from local storage
    const currentWishlist = this._WishlistService.currentWishlist;
    currentWishlist.forEach((productId: string) => {
      this._WishlistService.removeFromLocalWishlist(productId);
    });
    this.wishlistItems = [];
    this.toastr.info('Wishlist cleared', 'Wishlist');
  }
}
