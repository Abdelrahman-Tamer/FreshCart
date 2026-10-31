import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './core/components/login/login.component';
import { RegisterComponent } from './core/components/register/register.component';
import { ForgotPasswordComponent } from './core/components/forgot-password/forgot-password.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { HomeComponent } from './features/components/home/home.component';
import { NotfoundComponent } from './features/components/notfound/notfound.component';
import { BrandsComponent } from './features/components/brands/brands.component';
import { CategoriesComponent } from './features/components/categories/categories.component';
import { CartComponent } from './features/components/cart/cart.component';
import { ProductsComponent } from './features/components/products/products.component';
import { CheckoutComponent } from './features/components/checkout/checkout.component';
import { PaymentSuccessComponent } from './features/components/payment-success/payment-success.component';
import { WishlistComponent } from './features/components/wishlist/wishlist.component';
import { OrdersComponent } from './features/components/orders/orders.component';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: 'login', component: LoginComponent, title: 'FreshCart - Login' },
      { path: 'register', component: RegisterComponent, title: 'FreshCart - Register' },
      { path: 'forgot-password', component: ForgotPasswordComponent, title: 'FreshCart - Forgot Password' }
    ]
  },

  { path: 'payment-success', component: PaymentSuccessComponent, title: 'FreshCart - Payment Success' },
  { path: 'not-found', component: NotfoundComponent, title: 'FreshCart - Not Found' },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      // Public browsing routes
      { path: 'home', component: HomeComponent, title: 'FreshCart - Home' },
      { path: 'products', component: ProductsComponent, title: 'FreshCart - Products' },
      { path: 'categories', component: CategoriesComponent, title: 'FreshCart - Categories' },
      { path: 'brands', component: BrandsComponent, title: 'FreshCart - Brands' },
      {
        path: 'p_details/:p_id',
        loadComponent: () => import('./features/components/p-details/p-details.component').then((c) => c.PDetailsComponent),
        title: 'FreshCart - Product Details'
      },

      // Protected customer routes
      { path: 'profile', loadComponent: () => import('./features/components/profile/profile.component').then((c) => c.ProfileComponent), canActivate: [authGuard], title: 'FreshCart - My Profile' },
      { path: 'cart', component: CartComponent, canActivate: [authGuard], title: 'FreshCart - Shopping Cart' },
      { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard], title: 'FreshCart - My Wishlist' },
      { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard], title: 'FreshCart - Checkout' },
      { path: 'orders', component: OrdersComponent, canActivate: [authGuard], title: 'FreshCart - My Orders' },
      { path: 'allorders', redirectTo: 'orders', pathMatch: 'full' },
    ]
  },

  { path: '**', component: NotfoundComponent, title: 'FreshCart - 404 Not Found' }
];
