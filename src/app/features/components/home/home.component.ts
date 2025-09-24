import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { MainSliderComponent } from "./components/main-slider/main-slider.component";
import { CategoriesSliderComponent } from "./components/categories-slider/categories-slider.component";
import { RouterLink } from '@angular/router';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { WishlistService } from '../../../shared/services/Wishlist/wishlist.service';
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
  constructor(
    private _ProductsService:ProductsService, 
    private _CartService:CartService, 
    private _WishlistService: WishlistService,
    private toastr: ToastrService
  ){}
  
  products!:IProduct[]
  imageErrors: Set<string> = new Set(); // Track failed images
  fromInput = ''; // Search input property
  
  ngOnInit(): void {
    this._ProductsService.getAllProducts().subscribe({
      next:(res)=>{
        this.products = res.data
      }
    })

    // Load user's wishlist
    this._WishlistService.getUserWishlist().subscribe({
      next: (res) => {
        // Update local wishlist state
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

  addToCart(p_id:string){
    this._CartService.AddProductToCart(p_id).subscribe({
      next:(res)=>{
        this.toastr.success( res.message , res.status ,
          {
            timeOut : 3000,
            closeButton : true,
            progressBar: true,
            toastClass : 'myToast',
            positionClass : 'toast-top-left'
          }
         )
      },
    })
  }

  // Toggle wishlist item
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

  // Check if product is in wishlist
  isInWishlist(productId: string): boolean {
    return this._WishlistService.isInWishlist(productId);
  }

  // Handle image loading errors
  onImageError(event: any) {
    const img = event.target;
    
    // Try to find product ID from the DOM structure
    const productContainer = img.closest('.product');
    if (productContainer) {
      const routerLink = productContainer.querySelector('[routerLink]');
      if (routerLink) {
        const routerLinkValue = routerLink.getAttribute('ng-reflect-router-link');
        if (routerLinkValue) {
          const productId = routerLinkValue.split(',')[1]?.trim();
          if (productId) {
            this.imageErrors.add(productId);
          }
        }
      }
    }
    
    // Set fallback image or hide
    img.style.display = 'none';
    
    // Try alternative image sources
    if (img.src && !img.src.includes('placeholder')) {
      // You can add fallback image URL here
      // img.src = 'assets/images/product-placeholder.jpg';
    }
  }

  // Check if image has error
  isImageError(productId: string): boolean {
    return this.imageErrors.has(productId);
  }

}
