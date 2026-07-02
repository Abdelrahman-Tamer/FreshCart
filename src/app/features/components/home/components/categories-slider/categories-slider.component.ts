import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CatagoriesService } from '../../../../../shared/services/Categories/catagories.service';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-categories-slider',
  imports: [CarouselModule],
  templateUrl: './categories-slider.component.html',
  styleUrl: './categories-slider.component.css'
})
export class CategoriesSliderComponent implements OnInit {

  private readonly _CatagoriesService = inject(CatagoriesService);
  private readonly _Router = inject(Router);

  allCategories: any[] = [];

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    autoplay: true,
    autoplaySpeed: 1000,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: { items: 2 },
      400: { items: 3 },
      740: { items: 4 },
      940: { items: 6 }
    },
    nav: false
  }

  ngOnInit(): void {
    this._CatagoriesService.getAllCategories().subscribe({
      next: (res) => {
        this.allCategories = res.data;
      }
    });
  }

  navigateToCategory(category: any): void {
    this._Router.navigate(['/products'], { queryParams: { category: category.name } });
  }
}
