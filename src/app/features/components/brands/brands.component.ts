import { Component, OnInit } from '@angular/core';
import { BrandsService } from '../../../shared/services/Brands/brands.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  constructor(private _BrandsService: BrandsService) {}

  allBrands!: IBrand[]
  isLoading = true;
  error = '';
  imageErrors: Set<string> = new Set(); // Track failed images

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

  // Handle image loading errors
  onImageError(event: any, brandId: string) {
    const img = event.target;
    this.imageErrors.add(brandId);
    
    // Hide the broken image
    img.style.display = 'none';
  }

  // Check if image has error
  isImageError(brandId: string): boolean {
    return this.imageErrors.has(brandId);
  }

  navigateToBrand(brand: any): void {
    // Navigate to products with brand filter
    window.location.href = `/products?brand=${encodeURIComponent(brand.name)}`;
  }

}
