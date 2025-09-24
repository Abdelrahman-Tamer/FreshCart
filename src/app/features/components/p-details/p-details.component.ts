import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../shared/services/Products/products.service';
import { IProduct } from '../../../core/interfaces/iproduct.interface';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-p-details',
  imports: [CarouselModule],
  templateUrl: './p-details.component.html',
  styleUrl: './p-details.component.css'
})
export class PDetailsComponent implements OnInit{



  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    autoplay:true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }


  productId!:string
  productDetails:IProduct = {   }   as IProduct

  private readonly _ActivatedRoute = inject(ActivatedRoute)
  private readonly _ProductsService = inject(ProductsService)

  ngOnInit(): void {
    this._ActivatedRoute.paramMap.subscribe({
      next:(param)=>{
        this.productId = param.get('p_id')   !    ; 
      }
    })

    this._ProductsService.getSpecificProduct(this.productId).subscribe({
      next:(res)=>{
        this.productDetails = res.data
      },
      error:(err)=>{
        
      }
    })
    


  }


}
