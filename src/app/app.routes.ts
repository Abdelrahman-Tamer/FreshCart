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

export const routes: Routes = [

    { path: '', redirectTo: 'login', pathMatch: 'full' },

    {
        path: '', component: AuthLayoutComponent, children: [
            { path: 'login', component: LoginComponent, title: 'Login' },
            { path: 'register', component: RegisterComponent, title: 'Register' },
            { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Forgot Password' }
        ]
    },

    // Payment success route (no auth guard for Stripe return)
    { path: 'payment-success', component: PaymentSuccessComponent, title: 'Payment Success' },

    {
        path: '', component: MainLayoutComponent, canActivate: [authGuard], children: [

            { path: 'home', component: HomeComponent, title: 'Home' },
            { path: 'allorders', redirectTo: 'orders', pathMatch: 'full' },
            { path: 'brands', component: BrandsComponent, title: 'Brands' },
            { path: 'categories', component: CategoriesComponent, title: 'Categories' },
            { path: 'cart', component: CartComponent, title: 'Shopping Cart' },
            { path: 'wishlist', component: WishlistComponent, title: 'Wishlist' },
            { path: 'orders', component: OrdersComponent, title: 'My Orders' },
            { path: 'checkout', component: CheckoutComponent, title: 'Checkout' },
            { path: 'products', component: ProductsComponent, title: 'Products' },
            { path: 'p_details/:p_id', loadComponent: () => import('./features/components/p-details/p-details.component').then((c) => c.PDetailsComponent), title: 'product details' },
        ]
    },
    { path: "**", component: NotfoundComponent, title: '404' }

];
