import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { ICart } from '../../../core/interfaces/icart.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private readonly _CartService = inject(CartService);
  private readonly toastr = inject(ToastrService);

  cartData: ICart = {} as ICart;
  isLoading = true;
  updatingItemId: string | null = null;
  error = '';

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.error = '';
    this._CartService.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Failed to load your shopping cart';
      }
    });
  }

  changeCount(p_id: string, count: number) {
    if (count < 1) return;
    this.updatingItemId = p_id;
    this._CartService.UpdateCartProductQuantity(p_id, count).subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.updatingItemId = null;
      },
      error: () => {
        this.updatingItemId = null;
        this.toastr.error('Could not update quantity. Please try again.', 'Error');
      }
    });
  }

  deleteProduct(p_id: string) {
    this.updatingItemId = p_id;
    this._CartService.RemovespecifiCartItem(p_id).subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.updatingItemId = null;
        this.toastr.success('Item removed from cart', 'Cart Updated');
      },
      error: () => {
        this.updatingItemId = null;
        this.toastr.error('Could not remove item. Please try again.', 'Error');
      }
    });
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.isLoading = true;
      this._CartService.ClearCart().subscribe({
        next: () => {
          this.cartData = {} as ICart;
          this.isLoading = false;
          this.toastr.info('Your cart has been cleared', 'Cart Cleared');
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Failed to clear cart. Please try again.', 'Error');
        }
      });
    }
  }
}
