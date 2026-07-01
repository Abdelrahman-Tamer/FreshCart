<div align="center">
  <img src="public/images/freshcart-logo.svg" alt="FreshCart Logo" width="180"/>

  # 🛒 FreshCart — Modern E-Commerce Platform

  **Angular 20 · SSR · Tailwind CSS · Hybrid Rendering**

  [![Angular](https://img.shields.io/badge/Angular-20.2.1-DD0031?logo=angular&logoColor=white)]()
  [![SSR](https://img.shields.io/badge/SSR-Angle_bootstrap-0FAA0F)]()
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.12-06B6D4?logo=tailwindcss&logoColor=white)]()
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)]()
  [![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel&logoColor=white)]()

  A production-ready, server-side rendered e-commerce application with Stripe payment integration, built for performance and scalability.

  [Explore the Docs](#-features) · [Report Bug](https://github.com/Abdelrahman-Tamer/FreshCart/issues) · [Request Feature](https://github.com/Abdelrahman-Tamer/FreshCart/issues)

  <img src="public/images/grocery-banner.png" alt="FreshCart Showcase" width="100%"/>

</div>

---

## ✨ Features

<table>
  <tr>
    <td>🛍️ <b>Product Catalog</b></td>
    <td>Browse with search, sort by price/name/rating, and paginate through thousands of products</td>
  </tr>
  <tr>
    <td>🔍 <b>Advanced Filters</b></td>
    <td>Filter by category, brand, and price range with seamless URL query parameter support</td>
  </tr>
  <tr>
    <td>🛒 <b>Shopping Cart</b></td>
    <td>Full cart management — add, remove, adjust quantities, and real-time price calculations</td>
  </tr>
  <tr>
    <td>❤️ <b>Wishlist</b></td>
    <td>Save favorites locally with persistent storage and one-click toggle from any product card</td>
  </tr>
  <tr>
    <td>🔐 <b>Authentication</b></td>
    <td>JWT-based login/register with secure token storage, forgot-password flow (email → code → reset)</td>
  </tr>
  <tr>
    <td>💳 <b>Stripe Payments</b></td>
    <td>Cash on delivery or secure online card payments via Stripe checkout sessions</td>
  </tr>
  <tr>
    <td>📱 <b>Responsive Design</b></td>
    <td>Fluid grid from mobile to desktop using Tailwind CSS breakpoints</td>
  </tr>
  <tr>
    <td>⚡ <b>Hybrid SSR</b></td>
    <td>Static pages prerendered at build time; dynamic pages server-rendered for fresh data</td>
  </tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel (CDN)                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           Angular SSR Server                 │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │ Browser  │  │  Server  │  │   Node   │  │    │
│  │  │ Bundle   │  │  Bundle  │  │ Express  │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  │    │
│  └─────────────────────────────────────────────┘    │
│         ▲                    ▲                       │
│         │                    │                       │
│  ┌──────┴──────┐    ┌───────┴───────┐               │
│  │  Prerender  │    │  Server Sider │               │
│  │  (7 routes) │    │  (8 routes)   │               │
│  └─────────────┘    └───────────────┘               │
│         ▲                    ▲                       │
│         └────────┬───────────┘                      │
│                  │                                   │
│         ┌────────┴────────┐                          │
│         │  Angular SSR    │                          │
│         │  AngularNodeApp  │                         │
│         │  Engine          │                         │
│         └─────────────────┘                          │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────┐
│  REST API              │
│  (ecommerce.routemisr) │
└────────────────────────┘
```

### Render Strategy

| Route | Render Mode | Rationale |
|-------|-------------|-----------|
| `/home` | ✅ Prerendered | Static content, same for all users |
| `/products` | ✅ Prerendered | Product list is cached-friendly |
| `/brands` | ✅ Prerendered | Brand list changes infrequently |
| `/categories` | ✅ Prerendered | Category list changes infrequently |
| `/login` | ✅ Prerendered | Auth form is the same for everyone |
| `/register` | ✅ Prerendered | Auth form is the same for everyone |
| `/forgot-password` | ✅ Prerendered | Auth form is the same for everyone |
| `p_details/:p_id` | 🔄 Server-rendered | Product details need live API data |
| `/cart` | 🔄 Server-rendered | User-specific content |
| `/checkout` | 🔄 Server-rendered | User-specific with payment session |
| `/wishlist` | 🔄 Server-rendered | User-specific content |
| `/orders` | 🔄 Server-rendered | User-specific order history |
| `/payment-success` | 🔄 Server-rendered | Dynamic session verification |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <th>Category</th>
    <th>Technology</th>
    <th>Version</th>
  </tr>
  <tr><td>Framework</td><td>Angular</td><td>20.2.1</td></tr>
  <tr><td>SSR</td><td>@angular/ssr</td><td>20.2.1</td></tr>
  <tr><td>Server</td><td>Express.js (via AngularNodeAppEngine)</td><td>5.1.0</td></tr>
  <tr><td>Styling</td><td>Tailwind CSS</td><td>4.1.12</td></tr>
  <tr><td>UI Components</td><td>Flowbite</td><td>3.1.2</td></tr>
  <tr><td>Icons</td><td>Font Awesome (Free)</td><td>6.7</td></tr>
  <tr><td>Carousel</td><td>ngx-owl-carousel-o</td><td>20.0.1</td></tr>
  <tr><td>Notifications</td><td>ngx-toastr</td><td>19.0.0</td></tr>
  <tr><td>Auth</td><td>JWT (jwt-decode)</td><td>4.0.0</td></tr>
  <tr><td>Cookies</td><td>ngx-cookie-service</td><td>20.1.0</td></tr>
  <tr><td>Payment</td><td>Stripe (via API)</td><td>—</td></tr>
  <tr><td>Build</td><td>@angular/build (application builder)</td><td>20.2.1</td></tr>
  <tr><td>Language</td><td>TypeScript</td><td>5.9</td></tr>
  <tr><td>Deployment</td><td>Vercel</td><td>—</td></tr>
</table>

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Abdelrahman-Tamer/FreshCart.git
cd FreshCart

# Install dependencies
npm install

# Start development server (port 4200)
npm start

# Build for production (SSR + prerender)
npm run build

# Run tests
npm test
```

> **Note:** The development server uses Angular's dev-server with live reload. For full SSR preview, run `npm run build` followed by `npm run serve:ssr:e-commerce`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── app.ts                        # Root component
│   ├── app.config.ts                 # Client providers config
│   ├── app.config.server.ts          # SSR providers (server routes)
│   ├── app.routes.ts                 # Client routes (lazy-loaded)
│   ├── app.routes.server.ts          # Server render modes
│   ├── core/
│   │   ├── components/               # Auth components (login, register, forgot-password)
│   │   ├── guards/                   # Auth guard
│   │   ├── interceptors/             # HTTP interceptors (header, error)
│   │   ├── interfaces/               # TypeScript interfaces (product, cart, category)
│   │   ├── layouts/                  # Auth & main layout wrappers
│   │   └── services/                 # Flowbite initialization
│   ├── features/
│   │   └── components/               # All feature components
│   │       ├── home/                 # Home page + sub-components
│   │       ├── products/             # Product listing with filters
│   │       ├── p-details/            # Product details (lazy-loaded)
│   │       ├── cart/                 # Shopping cart
│   │       ├── checkout/             # Checkout with Stripe
│   │       ├── wishlist/             # User wishlist
│   │       ├── orders/               # Order history
│   │       ├── brands/               # Brand listing
│   │       ├── categories/           # Category listing
│   │       ├── payment-success/      # Payment verification
│   │       └── notfound/             # 404 page
│   └── shared/
│       ├── components/               # Navbar, Footer
│       ├── pipes/                    # Search pipe
│       └── services/                 # Auth, Cart, Products, etc.
├── environments/
│   ├── environment.ts                # Production API config
│   └── environment.development.ts    # Development API config
├── server.ts                         # Express SSR server
├── main.ts                           # Client bootstrap
└── main.server.ts                    # Server bootstrap
```

---

## 🔧 Configuration

### Environment Variables

Edit `src/environments/environment.ts` for production:

```typescript
export const environment = {
  baseURL: 'https://ecommerce.routemisr.com'
};
```

The development file `environment.development.ts` is swapped automatically via Angular file replacements when running in dev mode.

### Proxy Configuration

A proxy config exists at `proxy.conf.json` for local API development:

```json
{
  "/api/*": {
    "target": "https://ecommerce.routemisr.com",
    "secure": true,
    "changeOrigin": true
  }
}
```

---

## 🌐 Deployment (Vercel)

This project is pre-configured for **Vercel deployment** with full SSR support.

```bash
# Build the application
npm run build

# Output is in dist/e-commerce/
#   ├── browser/        # Client-side bundles + prerendered HTML
#   ├── server/         # SSR server bundles
#   └── prerendered-routes.json
```

The included `vercel.json` configures:
- Build command: `npm run build`
- Output directory: `dist/e-commerce`
- Framework: Angular (auto-detected)

### Deploy Steps

1. Push to GitHub
2. Connect repo to Vercel
3. Vercel auto-detects Angular + SSR
4. Deploy — done 🎉

---

## 🧪 Performance

| Metric | Value |
|--------|-------|
| Initial JS (gzipped) | ~220 kB |
| Initial CSS (gzipped) | ~32 kB |
| Prerendered pages | 7 (instant load) |
| Lazy-loaded routes | 1 (p-details) |
| LCP target | < 2.5s (SSR-optimized) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Abdelrahman Tamer**

- GitHub: [@Abdelrahman-Tamer](https://github.com/Abdelrahman-Tamer)

---

<div align="center">
  ⭐ Star this repository if you found it useful!
</div>
