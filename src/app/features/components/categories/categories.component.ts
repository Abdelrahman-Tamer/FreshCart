import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatagoriesService } from '../../../shared/services/Categories/catagories.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  
  allCategories: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  imageErrors: Set<string> = new Set();

  private _CatagoriesService = inject(CatagoriesService);

  ngOnInit(): void {
    this.getAllCategories();
  }

  getAllCategories(): void {
    this.isLoading = true;
    this.error = null;
    
    this._CatagoriesService.getAllCategories().subscribe({
      next: (response) => {
        this.allCategories = response.data || response;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.isLoading = false;
        console.error('Error loading categories:', err);
        
        // Fallback: create some mock categories for testing
        this.allCategories = [
          {
            _id: '1',
            name: 'Electronics',
            image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
          },
          {
            _id: '2', 
            name: 'Clothing',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
          },
          {
            _id: '3',
            name: 'Books',
            image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
          },
          {
            _id: '4',
            name: 'Home & Garden',
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
          },
          {
            _id: '5',
            name: 'Sports',
            image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
          },
          {
            _id: '6',
            name: 'Beauty',
            image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop'
          }
        ];
        this.isLoading = false;
        this.error = null;
      }
    });
  }

  onImageError(event: any): void {
    const img = event.target;
    const categoryId = img.getAttribute('data-category-id');
    if (categoryId) {
      this.imageErrors.add(categoryId);
    }
  }

  isImageError(categoryId: string): boolean {
    return this.imageErrors.has(categoryId);
  }

  navigateToCategory(category: any): void {
    // Navigate to products with category filter
    window.location.href = `/products?category=${encodeURIComponent(category.name)}`;
  }
}
