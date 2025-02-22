import {Component, OnInit} from '@angular/core';
import {CategoryService, Category} from '../../services/category.service';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  imports: [CommonModule]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  error: string = '';
  isAdmin: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService
  ) {
  }

  ngOnInit() {
    this.loadCategories();
    this.isAdmin = this.authService.currentUserRole.getValue() === 'ADMIN';
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: data => this.categories = data,
      error: () => this.error = 'Error fetching categories'
    });
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          alert('Category deleted.');
          this.loadCategories(); // refresh the list after deletion
        },
        error: () => alert('Error deleting category.')
      });
    }
  }
}
