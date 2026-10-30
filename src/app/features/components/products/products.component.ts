import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { AuthService } from '../../../shared/services/authentication/auth.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  private readonly _ProductsService = inject(ProductsService);
  private readonly _CartService = inject(CartService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _AuthService = inject(AuthService);
  private readonly _Router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly route = inject(ActivatedRoute);

  products: IProduct[] = [];
  isLoading = true;
  error = '';
  imageErrors: Set<string> = new Set();
  fromInput = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  // Filters
  selectedCategory = '';
  selectedBrand = '';
  priceRange = { min: 0, max: 10000 };
  sortBy = 'name'; // 'name', 'price-asc', 'price-desc', 'rating'

  // Mobile filters drawer state
  isFilterDrawerOpen = false;

  ngOnInit(): void {
    this.loadProducts();
    if (this._AuthService.isAuthenticated()) {
      this._WishlistService.refreshWishlist();
    }

    // React to query params from navbar or categories
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['brand']) {
        this.selectedBrand = params['brand'];
      }
      if (params['search']) {
        this.fromInput = params['search'];
      }
      this.updateTotalPages();
    });
  }

  loadProducts() {
    this.isLoading = true;
    this._ProductsService.getAllProducts().subscribe({
      next: (res) => {
        this.products = res.data;
        this.updateTotalPages();
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load products. Please check your connection and try again.';
        this.isLoading = false;
      }
    });
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.getFilteredProducts().length / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getFilteredProducts(): IProduct[] {
    if (!this.products?.length) return [];

    let filtered = [...this.products];

    // Filter by text search
    if (this.fromInput.trim()) {
      const q = this.fromInput.toLowerCase().trim();
      filtered = filtered.filter(p => p.title?.toLowerCase().includes(q));
    }

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category?.name === this.selectedCategory);
    }

    // Filter by brand
    if (this.selectedBrand) {
      filtered = filtered.filter(p => p.brand && p.brand.name === this.selectedBrand);
    }

    // Filter by price range
    filtered = filtered.filter(p => p.price >= this.priceRange.min && p.price <= this.priceRange.max);

    // Sort products
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return (b.ratingsAverage || 0) - (a.ratingsAverage || 0);
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

    return filtered;
  }

  getPaginatedProducts(): IProduct[] {
    const filtered = this.getFilteredProducts();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToTop();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToTop();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.scrollToTop();
  }

  scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  addToCart(productId: string) {
    if (!this._AuthService.isAuthenticated()) {
      this.toastr.info('Please sign in to add items to your cart', 'Sign In Required');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    this._CartService.AddProductToCart(productId).subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Product added to your cart', 'Added to Cart', {
          timeOut: 2500,
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
      this.toastr.info('Please sign in to save items to your wishlist', 'Sign In Required');
      this._Router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    if (this.isInWishlist(productId)) {
      this._WishlistService.removeFromWishlist(productId).subscribe({
        next: () => {
          this.toastr.info('Removed from your wishlist', 'Wishlist Updated', {
            timeOut: 2000,
            closeButton: true,
            progressBar: true
          });
        },
        error: () => {
          this.toastr.error('Could not update your wishlist. Please try again.', 'Wishlist');
        }
      });
    } else {
      this._WishlistService.addToWishlist(productId).subscribe({
        next: () => {
          this.toastr.success('Saved to your wishlist', 'Wishlist Updated', {
            timeOut: 2000,
            closeButton: true,
            progressBar: true
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

  onImageError(event: any, productId: string) {
    this.imageErrors.add(productId);
    event.target.style.display = 'none';
  }

  isImageError(productId: string): boolean {
    return this.imageErrors.has(productId);
  }

  getUniqueCategories(): string[] {
    if (!this.products?.length) return [];
    return [...new Set(this.products.map(p => p.category?.name).filter(Boolean))];
  }

  getUniqueBrands(): string[] {
    if (!this.products?.length) return [];
    return [...new Set(this.products.filter(p => p.brand?.name).map(p => p.brand.name))];
  }

  clearAllFilters() {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.fromInput = '';
    this.sortBy = 'name';
    this.priceRange = { min: 0, max: 10000 };
    this.currentPage = 1;
    this.updateTotalPages();
    this._Router.navigate([], { queryParams: {} });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.updateTotalPages();
  }
}
