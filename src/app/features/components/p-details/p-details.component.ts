import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-p-details',
  imports: [CarouselModule, CommonModule, RouterModule],
  templateUrl: './p-details.component.html',
  styleUrl: './p-details.component.css'
})
export class PDetailsComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    autoplay: false,
    navSpeed: 400,
    navText: ['', ''],
    responsive: {
      0: { items: 3 },
      400: { items: 4 },
      740: { items: 5 }
    },
    nav: false
  };

  productDetails: IProduct = {} as IProduct;
  activeImage = '';
  quantity = 1;
  isLoading = true;
  isAddingToCart = false;
  error = '';

  private readonly _ActivatedRoute = inject(ActivatedRoute);
  private readonly _ProductsService = inject(ProductsService);
  private readonly _DestroyRef = inject(DestroyRef);
  private readonly _CartService = inject(CartService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.pipe(
      takeUntilDestroyed(this._DestroyRef),
      switchMap(params => {
        const productId = params.get('p_id')!;
        this.isLoading = true;
        this.error = '';
        return this._ProductsService.getSpecificProduct(productId).pipe(
          catchError(() => {
            this.error = 'Failed to load product details';
            this.isLoading = false;
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (res) => {
        if (res?.data) {
          this.productDetails = res.data;
          this.activeImage = res.data.imageCover || res.data.images?.[0] || '';
          this.quantity = 1;
          this.isLoading = false;
        }
      }
    });
  }

  setActiveImage(img: string) {
    this.activeImage = img;
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(p_id: string) {
    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please sign in to add items to your cart', 'Sign In Required');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: `/p_details/${p_id}` } });
      return;
    }

    this.isAddingToCart = true;
    this._CartService.AddProductToCart(p_id).subscribe({
      next: (res) => {
        this.isAddingToCart = false;
        this.toastr.success(res.message || 'Product added to your cart', 'Added to Cart', {
          timeOut: 2500,
          closeButton: true,
          progressBar: true
        });
      },
      error: () => {
        this.isAddingToCart = false;
        this.toastr.error('Could not add product to cart. Please try again.', 'Shopping Cart');
      }
    });
  }

  toggleWishlist(productId: string) {
    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please sign in to save items to your wishlist', 'Sign In Required');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: `/p_details/${productId}` } });
      return;
    }

    if (this.isInWishlist(productId)) {
      this._WishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.toastr.info('Removed from your wishlist', 'Wishlist Updated');
        },
        error: () => {
          this.toastr.error('Could not update your wishlist. Please try again.', 'Wishlist');
        }
      });
    } else {
      this._WishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.toastr.success('Saved to your wishlist', 'Wishlist Updated');
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
}
