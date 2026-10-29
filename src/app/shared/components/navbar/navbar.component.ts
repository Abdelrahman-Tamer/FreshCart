import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/authentication/auth.service';
import { CartService } from '../../services/Cart/cart.service';
import { WishlistService } from '../../services/Wishlist/wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly _AuthService = inject(AuthService);
  private readonly _CartService = inject(CartService);
  private readonly _WishlistService = inject(WishlistService);
  private readonly _Router = inject(Router);

  isLoggedIn = false;
  userName = '';
  isMobileMenuOpen = false;
  searchQuery = '';
  private subscription?: Subscription;

  // Modern Angular signals for live reactivity
  readonly cartCount = this._CartService.cartCount;
  readonly wishlistCount = this._WishlistService.wishlistCount;

  ngOnInit(): void {
    this.subscription = this._AuthService.isLoggedIn.subscribe({
      next: (status) => {
        this.isLoggedIn = status;
        if (status) {
          this._AuthService.decodeToken();
          this.userName = this._AuthService.userName;
          this._CartService.refreshCart();
          this._WishlistService.refreshWishlist();
        } else {
          this.userName = '';
          this._CartService.resetState();
          this._WishlistService.resetState();
        }
      },
    });

    if (this._AuthService.isAuthenticated()) {
      this.isLoggedIn = true;
      this._AuthService.decodeToken();
      this.userName = this._AuthService.userName;
      this._CartService.refreshCart();
      this._WishlistService.refreshWishlist();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      this._Router.navigate(['/products'], {
        queryParams: { search: this.searchQuery.trim() }
      });
      this.searchQuery = '';
      this.isMobileMenuOpen = false;
    }
  }

  logOut(): void {
    this._AuthService.logOut();
    this._CartService.resetState();
    this._WishlistService.resetState();
    this._Router.navigate(['/login']);
  }
}
