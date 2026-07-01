import { Component, inject, OnInit } from '@angular/core';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { ICart } from '../../../core/interfaces/icart.interface';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  private readonly _CartService = inject(CartService);

  cartData : ICart = {  } as ICart

  ngOnInit(): void {
    this._CartService.GetLoggedUserCart().subscribe({
      next: (res) => {
        this.cartData = res.data
      },
    });
  }




  changeCount(p_id:string , count:number){
    this._CartService.UpdateCartProductQuantity(p_id , count).subscribe({
      next:(res)=>{
        this.cartData = res.data
      }
    })
  }


    deleteProduct(p_id:string){
    this._CartService.RemovespecifiCartItem(p_id).subscribe({
      next:(res)=>{
        this.cartData = res.data
      }
    })
  }

}
