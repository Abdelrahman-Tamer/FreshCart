import { Component, OnInit, inject, OnDestroy, HostListener } from '@angular/core';
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
  isUserDropdownOpen = false;
  searchQuery = '';
  private subscription?: Subscription;

  // Modern Angular signals for live reactivity
  readonly cartCount = this._CartService.cartCount;
  readonly wishlistCount = this._WishlistService.wishlistCount;

  get userInitials(): string {
    if (!this.userName) return 'U';
    const parts = this.userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  get userFirstName(): string {
    if (!this.userName) return 'Account';
    return this.userName.trim().split(/\s+/)[0];
  }

  get userAvatar(): string {
    return this._AuthService.userAvatar;
  }

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

    // Real-time synchronization whenever the user name is updated anywhere
    const nameSub = this._AuthService.userName$.subscribe((name) => {
      if (this.isLoggedIn && name) {
        this.userName = name;
      }
    });
    this.subscription.add(nameSub);

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

  toggleUserDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  clearSearch(): void {
    this.searchQuery = '';
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isUserDropdownOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isUserDropdownOpen = false;
    this.isMobileMenuOpen = false;
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
    this.isUserDropdownOpen = false;
    this.isMobileMenuOpen = false;
    this._AuthService.logOut();
    this._CartService.resetState();
    this._WishlistService.resetState();
    this._Router.navigate(['/login']);
  }
}
