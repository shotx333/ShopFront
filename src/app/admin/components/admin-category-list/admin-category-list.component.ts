import { Component } from '@angular/core';
import {Category, CategoryService} from '../../../services/category.service';
import {NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-admin-category-list',
  imports: [
    NgIf,
    NgForOf,
    RouterLink
  ],
  templateUrl: './admin-category-list.component.html',
  styleUrl: './admin-category-list.component.scss'
})
export class AdminCategoryListComponent {
  categories: Category[] = [];
  error: string = '';

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      /**
       * Called when an error occurs while fetching categories.
       * Sets the component's `error` field to the provided error message.
       */
      error: () => this.error = 'Error fetching categories'
    });
  }

  deleteCategory(categoryId: number): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe({
        next: () => {
          alert('Category deleted successfully.');
          this.loadCategories();
        },
        error: () => alert('Error deleting category.')

      });
    }
  }
}
