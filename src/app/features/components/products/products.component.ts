import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SearchPipe } from '../../../shared/pipes/search.pipe';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule, SearchPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {

  constructor(
    private _ProductsService: ProductsService,
    private _CartService: CartService,
    private _WishlistService: WishlistService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  products!: IProduct[]
  isLoading = true;
  error = '';
  imageErrors: Set<string> = new Set();
  fromInput = ''; // Search input property

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;

  // Filters
  selectedCategory = '';
  selectedBrand = '';
  priceRange = { min: 0, max: 10000 };
  sortBy = 'name'; // 'name', 'price', 'rating'

  ngOnInit(): void {
    this.loadProducts();
    this.loadWishlist();
    
    // Check for category and brand filters from route params
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['brand']) {
        this.selectedBrand = params['brand'];
      }
      // Update total pages when filters are set from URL
      if (params['category'] || params['brand']) {
        setTimeout(() => this.updateTotalPages(), 100);
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this._ProductsService.getAllProducts().subscribe({
      next: (res) => {
        this.products = res.data;
        this.updateTotalPages();
        this.isLoading = false;
        
        // Ensure products loaded
      },
      error: (err) => {
        this.error = 'Failed to load products';
        this.isLoading = false;
      }
    });
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.getFilteredProducts().length / this.itemsPerPage);
  }

  loadWishlist() {
    this._WishlistService.getUserWishlist().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          res.data.forEach((item: any) => {
            this._WishlistService.addToLocalWishlist(item._id);
          });
        }
      },
      error: (err) => {
      }
    });
  }

  // Get paginated products
  getPaginatedProducts(): IProduct[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.getFilteredProducts().slice(startIndex, endIndex);
  }

  // Get filtered products
  getFilteredProducts(): IProduct[] {
    let filtered = [...this.products];

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category.name === this.selectedCategory);
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
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.ratingsAverage - a.ratingsAverage;
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  // Cart methods
  addToCart(productId: string) {
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

  // Wishlist methods
  toggleWishlist(productId: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.isInWishlist(productId)) {
      this._WishlistService.removeFromLocalWishlist(productId);
      this.toastr.info('Removed from wishlist', 'Wishlist', {
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    } else {
      this._WishlistService.addToLocalWishlist(productId);
      this.toastr.success('Added to wishlist', 'Wishlist', {
        timeOut: 2000,
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
    }
  }

  isInWishlist(productId: string): boolean {
    return this._WishlistService.isInWishlist(productId);
  }

  // Image error handling
  onImageError(event: any, productId: string) {
    this.imageErrors.add(productId);
    event.target.style.display = 'none';
    
    // Try to reload the image with different parameters
    const img = event.target;
    if (img.src && !img.src.includes('?retry=1')) {
      setTimeout(() => {
        img.src = img.src + '?retry=1';
        img.style.display = 'block';
      }, 1000);
    }
  }

  isImageError(productId: string): boolean {
    return this.imageErrors.has(productId);
  }

  // Get unique categories for filter
  getUniqueCategories(): string[] {
    return [...new Set(this.products.map(p => p.category.name))];
  }

  // Get unique brands for filter
  getUniqueBrands(): string[] {
    return [...new Set(this.products.filter(p => p.brand && p.brand.name).map(p => p.brand.name))];
  }

  // Update total pages when filters change
  onFilterChange() {
    this.updateTotalPages();
    this.currentPage = 1; // Reset to first page when filters change
  }

}
