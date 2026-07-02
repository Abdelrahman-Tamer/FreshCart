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
        this.error = err.error?.message || 'Failed to load cart';
      }
    });
  }

  changeCount(p_id: string, count: number) {
    this._CartService.UpdateCartProductQuantity(p_id, count).subscribe({
      next: (res) => {
        this.cartData = res.data;
      },
      error: () => {
        this.toastr.error('Failed to update quantity', 'Error');
      }
    });
  }

  deleteProduct(p_id: string) {
    this._CartService.RemovespecifiCartItem(p_id).subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.toastr.success('Item removed from cart', 'Cart');
      },
      error: () => {
        this.toastr.error('Failed to remove item', 'Error');
      }
    });
  }
}
