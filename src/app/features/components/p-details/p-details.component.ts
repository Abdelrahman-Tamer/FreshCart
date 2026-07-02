import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../shared/services/Cart/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-p-details',
  imports: [CarouselModule, CommonModule, RouterModule],
  templateUrl: './p-details.component.html',
  styleUrl: './p-details.component.css'
})
export class PDetailsComponent implements OnInit {
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    autoplay: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 }
    },
    nav: false
  }

  productDetails: IProduct = {} as IProduct
  isLoading = true;
  error = '';

  private readonly _ActivatedRoute = inject(ActivatedRoute)
  private readonly _ProductsService = inject(ProductsService)
  private readonly _DestroyRef = inject(DestroyRef)
  private readonly _CartService = inject(CartService)
  private readonly toastr = inject(ToastrService)

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.pipe(
      takeUntilDestroyed(this._DestroyRef),
      switchMap(params => {
        const productId = params.get('p_id')!;
        this.isLoading = true;
        this.error = '';
        return this._ProductsService.getSpecificProduct(productId).pipe(
          catchError(() => {
            this.error = 'Failed to load product details';
            this.isLoading = false;
            return of(null);
          })
        );
      })
    ).subscribe({
      next: (res) => {
        if (res) {
          this.productDetails = res.data;
          this.isLoading = false;
        }
      }
    })
  }

  addToCart(p_id: string) {
    this._CartService.AddProductToCart(p_id).subscribe({
      next: (res) => {
        this.toastr.success(res.message, res.status, {
          timeOut: 3000,
          closeButton: true,
          progressBar: true
        });
      },
    });
  }
}
