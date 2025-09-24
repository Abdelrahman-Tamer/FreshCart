import { Component } from '@angular/core';
import { ICategory } from '../../../../../core/interfaces/icategory.interface';
import { CatagoriesService } from '../../../../../shared/services/Categories/catagories.service';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-categories-slider',
  imports: [CarouselModule],
  templateUrl: './categories-slider.component.html',
  styleUrl: './categories-slider.component.css',
})
export class CategoriesSliderComponent {
  constructor(private _CatagoriesService: CatagoriesService) {}

  allCategories!: ICategory[];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    autoplay:true,
    margin:10,
    autoplaySpeed: 500 ,
    // autoplayTimeout: 100 ,
    autoplayHoverPause:true, 
    navText: ['', ''],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 6,
      },
    },
    nav: false,
  };

  ngOnInit(): void {
    this._CatagoriesService.getAllCategories().subscribe({
      next: (res) => {
        this.allCategories = res.data;
      },
      error: (err) => {
      },
    });
  }
}
