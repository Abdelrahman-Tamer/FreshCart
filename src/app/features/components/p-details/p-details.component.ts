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
  relatedProducts: IProduct[] = [];
  activeImage = '';
  quantity = 1;
  isLoading = true;
  isLoadingRelated = false;
  isAddingToCart = false;
  error = '';

  // Gallery zoom & modal
  isZoomed = false;
  zoomPos = { x: 50, y: 50 };
  isLightboxOpen = false;

  // Tabs
  activeTab: 'description' | 'specifications' | 'shipping' = 'description';

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
        this.quantity = 1;
        this.isZoomed = false;
        this.isLightboxOpen = false;
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
          if (this.productDetails.category?.name) {
            this.loadRelatedProducts(this.productDetails.category.name, this.productDetails._id);
          }
        }
      }
    });
  }

  loadRelatedProducts(categoryName: string, currentId: string): void {
    this.isLoadingRelated = true;
    this._ProductsService.getAllProducts().subscribe({
      next: (res) => {
        this.isLoadingRelated = false;
        if (res?.data) {
          const matching = res.data.filter((p: IProduct) => p._id !== currentId && p.category?.name === categoryName);
          if (matching.length >= 4) {
            this.relatedProducts = matching.slice(0, 4);
          } else {
            const others = res.data.filter((p: IProduct) => p._id !== currentId && !matching.some((m: IProduct) => m._id === p._id));
            this.relatedProducts = [...matching, ...others].slice(0, 4);
          }
        }
      },
      error: () => {
        this.isLoadingRelated = false;
      }
    });
  }

  setActiveImage(img: string): void {
    this.activeImage = img;
  }

  prevImage(): void {
    const list = this.productDetails.images;
    if (!list || list.length <= 1) return;
    const currentIndex = list.indexOf(this.activeImage);
    const nextIndex = currentIndex <= 0 ? list.length - 1 : currentIndex - 1;
    this.activeImage = list[nextIndex];
  }

  nextImage(): void {
    const list = this.productDetails.images;
    if (!list || list.length <= 1) return;
    const currentIndex = list.indexOf(this.activeImage);
    const nextIndex = currentIndex >= list.length - 1 ? 0 : currentIndex + 1;
    this.activeImage = list[nextIndex];
  }

  getCurrentImageIndex(): number {
    const list = this.productDetails.images;
    if (!list || list.length <= 1) return 1;
    const idx = list.indexOf(this.activeImage);
    return idx >= 0 ? idx + 1 : 1;
  }

  onMouseMove(e: MouseEvent): void {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    this.zoomPos = { x, y };
  }

  openLightbox(): void {
    this.isLightboxOpen = true;
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
  }

  increaseQuantity(): void {
    if (this.productDetails.quantity && this.quantity >= this.productDetails.quantity) {
      this.toastr.warning(`Only ${this.productDetails.quantity} items available in stock`, 'Stock Limit');
      return;
    }
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  setActiveTab(tab: 'description' | 'specifications' | 'shipping'): void {
    this.activeTab = tab;
  }

  getDiscountPercentage(): number {
    if (this.productDetails.priceAfterDiscount && this.productDetails.price > this.productDetails.priceAfterDiscount) {
      return Math.round(((this.productDetails.price - this.productDetails.priceAfterDiscount) / this.productDetails.price) * 100);
    }
    return 0;
  }

  copyProductLink(): void {
    if (typeof window !== 'undefined' && navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.toastr.info('Product link copied to clipboard', 'Share Link', {
          timeOut: 2000,
          progressBar: true
        });
      }).catch(() => {
        this.toastr.info('Could not copy link', 'Share');
      });
    }
  }

  addToCart(p_id: string): void {
    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please sign in to add items to your cart', 'Sign In Required');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: `/p_details/${p_id}` } });
      return;
    }

    this.isAddingToCart = true;
    this._CartService.AddProductToCart(p_id).subscribe({
      next: (res) => {
        if (this.quantity > 1) {
          this._CartService.UpdateCartProductQuantity(p_id, this.quantity).subscribe({
            next: () => {
              this.isAddingToCart = false;
              this.toastr.success(`Added ${this.quantity} items to your cart`, 'Added to Cart', {
                timeOut: 2500,
                closeButton: true,
                progressBar: true
              });
            },
            error: () => {
              this.isAddingToCart = false;
              this.toastr.success(res.message || 'Product added to your cart', 'Added to Cart');
            }
          });
        } else {
          this.isAddingToCart = false;
          this.toastr.success(res.message || 'Product added to your cart', 'Added to Cart', {
            timeOut: 2500,
            closeButton: true,
            progressBar: true
          });
        }
      },
      error: () => {
        this.isAddingToCart = false;
        this.toastr.error('Could not add product to cart. Please try again.', 'Shopping Cart');
      }
    });
  }

  buyNow(p_id: string): void {
    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please sign in to proceed with direct checkout', 'Sign In Required');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: `/p_details/${p_id}` } });
      return;
    }

    this.isAddingToCart = true;
    this._CartService.AddProductToCart(p_id).subscribe({
      next: () => {
        if (this.quantity > 1) {
          this._CartService.UpdateCartProductQuantity(p_id, this.quantity).subscribe({
            next: () => {
              this.isAddingToCart = false;
              this._Router.navigate(['/cart']);
            },
            error: () => {
              this.isAddingToCart = false;
              this._Router.navigate(['/cart']);
            }
          });
        } else {
          this.isAddingToCart = false;
          this._Router.navigate(['/cart']);
        }
      },
      error: () => {
        this.isAddingToCart = false;
        this.toastr.error('Could not initiate checkout. Please try again.', 'Shopping Cart');
      }
    });
  }

  toggleWishlist(productId: string): void {
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
