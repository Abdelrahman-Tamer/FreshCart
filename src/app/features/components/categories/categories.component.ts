import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  private _Router = inject(Router);

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
    this._Router.navigate(['/products'], { queryParams: { category: category.name } });
  }
}
