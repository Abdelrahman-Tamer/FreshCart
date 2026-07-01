import { Component, inject, OnInit } from '@angular/core';
import { BrandsService } from '../../../shared/services/Brands/brands.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-brands',
  imports: [CommonModule, RouterModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.css'
})
export class BrandsComponent implements OnInit {
  private readonly _BrandsService = inject(BrandsService);
  private readonly _Router = inject(Router);

  allBrands!: IBrand[]
  isLoading = true;
  error = '';
  imageErrors: Set<string> = new Set();

  ngOnInit(): void {
    this._BrandsService.getAllBrands().subscribe({
      next: (res) => {
        this.allBrands = res.data
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load brands';
        this.isLoading = false;
      }
    })
  }

  onImageError(event: any, brandId: string) {
    const img = event.target;
    this.imageErrors.add(brandId);
    img.style.display = 'none';
  }

  isImageError(brandId: string): boolean {
    return this.imageErrors.has(brandId);
  }

  navigateToBrand(brand: any): void {
    this._Router.navigate(['/products'], { queryParams: { brand: brand.name } });
  }
}
