<div align="center">
  <img src="public/images/freshcart-logo.svg" alt="FreshCart Logo" width="220"/>

  # 🛒 FreshCart — Premium E-Commerce Web Platform

  **Modern Angular 20 · Signals · Hybrid SSR · Tailwind CSS · Stripe Payment Lifecycle**

  [![Angular](https://img.shields.io/badge/Angular-20.2.1-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
  [![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passing-brightgreen?style=for-the-badge)](https://karma-runner.github.io/)

  A high-performance, production-ready e-commerce platform built with Angular 20 standalone architecture, reactive Signals, server-side rendering (SSR), and end-to-end payment processing.

  [Explore Features](#-core-features) · [Architecture](#-architecture--rendering-strategy) · [Payment Verification](#-end-to-end-payment-flow) · [Quick Start](#-quick-start)

  <br/>
  <img src="public/images/grocery-banner.png" alt="FreshCart Banner" width="100%"/>
</div>

---

## 🌟 Overview

**FreshCart** is a production-grade online grocery and retail shopping application designed for modern speed, visual polish, and truthful commercial integrity. It integrates directly with the RouteMisr REST API, delivering an intuitive shopping experience with zero AI-template bloat, accessible typography, fluid responsive viewports, and secure transaction handling.

---

## ✨ Core Features

<table>
  <tr>
    <td width="35%">🛍️ <b>Dynamic Product Catalog</b></td>
    <td>High-speed browsing with instant client-side name search, multi-criteria sorting (Price, Rating, Alphabetical), and responsive category & brand filtering.</td>
  </tr>
  <tr>
    <td>🖼️ <b>Clean Product Presentation</b></td>
    <td>Aspect-square image containers with <code>object-contain</code>, subtle hover elevation (scale 1.02, 180ms ease), accessible wishlist heart toggles, and live rating badges.</td>
  </tr>
  <tr>
    <td>🛒 <b>Reactive Cart & Signals</b></td>
    <td>Unified state management via Angular Signals (<code>cartCount</code>, <code>cartTotal</code>, <code>cartId</code>). Instant header badge updates on add, remove, and quantity change.</td>
  </tr>
  <tr>
    <td>❤️ <b>Persistent Wishlist</b></td>
    <td>One-click wishlist toggling with visual state reflection across all cards, catalog views, and dedicated wishlist management.</td>
  </tr>
  <tr>
    <td>🔐 <b>Authentication & Route Guards</b></td>
    <td>Secure JWT authentication with <code>ngx-cookie-service</code>, protected customer routes (<code>authGuard</code>), and guest redirection (<code>guestGuard</code>) preventing logged-in users from accessing auth forms.</td>
  </tr>
  <tr>
    <td>💳 <b>Dual Payment Lifecycle</b></td>
    <td>Complete checkout support for <b>Cash on Delivery</b> and <b>Online Card Payment (Stripe Sandbox)</b> with end-to-end session verification, return URL routing, and server-side cart clearing.</td>
  </tr>
  <tr>
    <td>📦 <b>Live Order History</b></td>
    <td>Direct database order tracking at <code>/orders</code> showing order reference IDs, delivery addresses, items, and status indicators (<i>Pending Payment</i> / <i>Processing</i> / <i>Delivered</i>).</td>
  </tr>
  <tr>
    <td>⚡ <b>Hybrid SSR & Prerendering</b></td>
    <td>7 static routes prerendered at build time for instant initial content paint; dynamic routes server-rendered for fresh data hydration.</td>
  </tr>
  <tr>
    <td>♿ <b>Accessibility & Motion</b></td>
    <td>WCAG 2.2 AA compliant contrast, 44px tap targets, keyboard navigation, and automatic animation disabling under <code>prefers-reduced-motion</code>.</td>
  </tr>
</table>

---

## 🏗 Architecture & Rendering Strategy

FreshCart utilizes Angular 20's **Application Builder** (`@angular/build`) combined with `@angular/ssr` and an Express-powered `AngularNodeAppEngine`.

```
┌────────────────────────────────────────────────────────┐
│                   Vercel / Node Host                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │             Angular SSR Express Engine           │  │
│  │   ┌───────────────┐          ┌───────────────┐   │  │
│  │   │  Prerendered  │          │   Dynamic     │   │  │
│  │   │  (7 Routes)   │          │  (8 Routes)   │   │  │
│  │   └───────┬───────┘          └───────┬───────┘   │  │
│  └───────────┼──────────────────────────┼───────────┘  │
└──────────────┼──────────────────────────┼──────────────┘
               ▼                          ▼
      Static Cache (CDN)         Hydrated App + Signals
               │                          │
               └───────────┬──────────────┘
                           ▼
             ┌───────────────────────────┐
             │    RouteMisr REST API     │
             │   (Auth, Cart, Orders)    │
             └───────────────────────────┘
```

### Route Delivery Matrix

| Route | Mode | Rationale |
| :--- | :---: | :--- |
| `/home` | ✅ **Prerendered** | Static homepage shell with client-hydrated sliders |
| `/products` | ✅ **Prerendered** | Fast initial catalog paint; query params handled client-side |
| `/categories` | ✅ **Prerendered** | Category directory with low update frequency |
| `/brands` | ✅ **Prerendered** | Brand directory with low update frequency |
| `/login` | ✅ **Prerendered** | Static auth form (protected by `guestGuard` on client) |
| `/register` | ✅ **Prerendered** | Static registration form (protected by `guestGuard`) |
| `/forgot-password` | ✅ **Prerendered** | Multi-step recovery workflow shell |
| `/p_details/:p_id` | 🔄 **Server-Rendered** | Dynamic product data fetched on demand per ID |
| `/cart` | 🔄 **Server-Rendered** | User-specific cart with reactive count & totals |
| `/checkout` | 🔄 **Server-Rendered** | Delivery address form & payment method selection |
| `/wishlist` | 🔄 **Server-Rendered** | Authenticated customer favorite items |
| `/orders` | 🔄 **Server-Rendered** | Authenticated order history queried by customer ID |
| `/payment-success` | 🔄 **Server-Rendered** | Stripe session ID verification endpoint |

---

## 💳 End-to-End Payment Flow

The payment architecture supports safe external navigation to Stripe Checkout and return to store without state loss:

```
[ Checkout Form ]
        │
        ├── Cash Selected ───► POST /api/v1/orders/:cartId ──► Order Created ──► Navigate to /orders
        │
        └── Card Selected ───► POST /api/v1/orders/checkout-session/:cartId?url=${origin}
                                           │
                                           ▼
                                 [ Stripe Checkout URL ]
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             User Completes Payment                        User Clicks "Back"
                    │                                             │
                    ▼                                             ▼
       Redirect to ${origin}/allorders               Redirect to ${origin}/cart
                    │                                             │
                    ▼                                             ▼
       Routes to /orders component                   Cart items & session preserved
       Order loaded from backend API                 User can retry or adjust items
```

### Verified Test Matrix

| Scenario | Type | Executed Action | Result | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Cash Order** | API / UI | Validated address & phone, clicked "Place Order with Cash" | Order created on server, cart reset to 0, navigated to `/orders` | **PASS** |
| **Stripe Session** | API | Requested checkout session with `?url=origin` | Valid Stripe session URL returned (`cs_test_...`) | **PASS** |
| **Stripe Navigation** | Browser | Navigated to external Stripe checkout page | Loaded official sandbox with pre-filled customer email & total | **PASS** |
| **Payment Cancel** | Browser | Clicked Stripe "Back" link | Safely returned to `/cart`, items intact, user remains logged in | **PASS** |
| **Session Continuity**| Security | Re-entered app after external redirect | Auth cookie retained; route guards allowed access | **PASS** |
| **Double-Click Lock** | UX | Form submission during active HTTP request | Button disabled with loading spinner, preventing duplicate orders | **PASS** |

---

## 📁 Project Structure

```
FreshCart/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── components/          # Auth components (login, register, forgot-password)
│   │   │   ├── guards/              # authGuard & guestGuard
│   │   │   ├── interceptors/        # header-interceptor & error-interceptor
│   │   │   ├── interfaces/          # TypeScript contracts (cart, product, category)
│   │   │   └── layouts/             # auth-layout & main-layout
│   │   ├── features/
│   │   │   └── components/
│   │   │       ├── home/            # Home page + main & categories sliders
│   │   │       ├── products/        # Product catalog with search & sort
│   │   │       ├── p-details/       # Product details & image gallery
│   │   │       ├── cart/            # Interactive shopping cart
│   │   │       ├── checkout/        # Checkout form (Cash & Stripe)
│   │   │       ├── wishlist/        # Customer saved items
│   │   │       ├── orders/          # Live order history & receipt view
│   │   │       ├── brands/          # Brand directory
│   │   │       ├── categories/      # Category directory
│   │   │       ├── payment-success/ # Stripe transaction verification
│   │   │       └── notfound/        # Custom 404 page
│   │   ├── shared/
│   │   │   ├── components/          # Navbar, truthful Footer
│   │   │   ├── pipes/               # Search & filter pipes
│   │   │   └── services/            # CartService, PaymentService, AuthService, etc.
│   │   ├── app.routes.ts            # Client routing configuration
│   │   └── app.routes.server.ts     # SSR prerender & server route modes
│   ├── environments/                # Base URL configuration (RouteMisr API)
│   └── styles.css                   # Tailwind CSS tokens, card standards & a11y
├── public/                          # Favicon & brand assets
├── angular.json                     # Workspace build & test configuration
├── package.json                     # Dependencies & scripts
└── README.md                        # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` recommended
- **npm**: `v10.x` or higher

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/Abdelrahman-Tamer/FreshCart.git
cd FreshCart

# 2. Install dependencies
npm install

# 3. Start development server
npm start
# App runs at: http://localhost:4200/

# 4. Run Karma unit test suite (Headless Chrome)
npm test -- --watch=false --browsers=ChromeHeadless

# 5. Build for production (SSR + Prerender)
npm run build
```

---

## 🧪 Testing & Quality Gates

FreshCart enforces automated testing and production compilation verification:

```bash
# Execute unit tests
npm test -- --watch=false --browsers=ChromeHeadless
# Output: TOTAL: 13 SUCCESS (0.176s)

# Execute production build
npm run build
# Output: Prerendered 7 static routes. Application bundle generation complete. (Exit code 0)
```

---

## 👨‍💻 Author & Maintainer

**Abdelrahman Tamer**
- GitHub: [@Abdelrahman-Tamer](https://github.com/Abdelrahman-Tamer)
- Repository: [FreshCart](https://github.com/Abdelrahman-Tamer/FreshCart)

---

<div align="center">
  <sub>Built with Angular 20, Tailwind CSS, and engineering discipline.</sub>
</div>
