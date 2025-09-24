# FreshCart - E-commerce Application

A modern, responsive e-commerce application built with Angular 20, featuring a clean and intuitive user interface.

## 🚀 Features

- **Product Catalog**: Browse and search through a wide range of products
- **Category Filtering**: Filter products by categories with direct navigation
- **Brand Filtering**: Filter products by brands
- **Shopping Cart**: Add, remove, and manage items in your cart
- **Wishlist**: Save your favorite products for later
- **User Authentication**: Secure login and registration system
- **Order Management**: Track your orders and order history
- **Payment Integration**: Stripe payment integration for secure transactions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Angular 20
- **Styling**: Tailwind CSS
- **Icons**: Font Awesome
- **Carousel**: ngx-owl-carousel-o
- **Notifications**: ngx-toastr
- **Authentication**: JWT tokens
- **Payment**: Stripe integration
- **State Management**: Angular Services

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abdelrahman-Tamer/FreshCart.git
   cd FreshCart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 🏗️ Build for Production

```bash
npm run build
```

## 🧪 Running Tests

```bash
npm test
```

## 📱 Screenshots

### Home Page
- Modern hero section with product carousel
- Featured categories
- Popular products grid

### Product Catalog
- Advanced filtering by category and brand
- Search functionality
- Sorting options
- Pagination

### Shopping Cart
- Add/remove items
- Quantity management
- Price calculations

### User Authentication
- Secure login/register forms
- Password reset functionality
- User profile management

## 🔧 Configuration

### Environment Variables
Create a `src/environments/environment.ts` file:

```typescript
export const environment = {
  production: false,
  baseURL: 'YOUR_API_BASE_URL'
};
```

### API Integration
The application is designed to work with a REST API. Update the base URL in the environment files to point to your backend API.

## 🎨 Design Features

- **Modern UI**: Clean and intuitive design
- **Responsive Layout**: Works on all device sizes
- **Smooth Animations**: Enhanced user experience with transitions
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant design

## 🚀 Deployment

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### GitHub Pages
```bash
npm run build --prod
npx angular-cli-ghpages --dir=dist/e-commerce
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abdelrahman Tamer**
- GitHub: [@Abdelrahman-Tamer](https://github.com/Abdelrahman-Tamer)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and testers

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the author.

---

⭐ Star this repository if you found it helpful!