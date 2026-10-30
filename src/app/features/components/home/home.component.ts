import { Component, OnInit, inject } from '@angular/core';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { MainSliderComponent } from "./components/main-slider/main-slider.component";
import { CategoriesSliderComponent } from "./components/categories-slider/categories-slider.component";
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from '../../../shared/pipes/search.pipe';

@Component({
  imports: [MainSliderComponent, RouterLink, CommonModule, FormsModule, SearchPipe, CategoriesSliderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly _ProductsService = inject(ProductsService);
  private readonly _CartService = inject(CartService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly toastr = inject(ToastrService);

  products: IProduct[] | undefined;
  imageErrors: Set<string> = new Set();
  fromInput = '';

  ngOnInit(): void {
    this._ProductsService.getAllProducts().subscribe({
      next: (res) => {
        this.products = res.data;
      },
      error: () => {
        this.products = [];
      }
    });

    if (this._AuthService.isAuthenticated()) {
      this._WishlistService.refreshWishlist();
    }
  }

  addToCart(p_id: string) {
    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please log in to add items to your cart', 'Cart');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: '/home' } });
      return;
    }

    this._CartService.AddProductToCart(p_id).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Product added to cart', 'Success', {
          timeOut: 3000,
          closeButton: true,
          progressBar: true
        });
      },
      error: () => {
        this.toastr.error('Could not add product to cart. Please try again.', 'Shopping Cart');
      }
    });
  }

  toggleWishlist(productId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please log in to save items to your wishlist', 'Wishlist');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: '/home' } });
      return;
    }

    if (this.isInWishlist(productId)) {
      this._WishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.toastr.info('Removed from wishlist', 'Wishlist', {
            timeOut: 2000, closeButton: true, progressBar: true
          });
        },
        error: () => {
          this.toastr.error('Could not update your wishlist. Please try again.', 'Wishlist');
        }
      });
    } else {
      this._WishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.toastr.success('Added to wishlist', 'Wishlist', {
            timeOut: 2000, closeButton: true, progressBar: true
          });
        },
        error: () => {
          this.toastr.error('Could not update your wishlist. Please try again.', 'Wishlist');
        }
      });
    }
  }

  isInWishlist(productId: string): boolean {
    return this._WishlistService.isInWishlist(productId);
  }

  isImageError(productId: string): boolean {
    return this.imageErrors.has(productId);
  }
}
