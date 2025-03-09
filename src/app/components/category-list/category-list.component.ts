import {Component, OnInit} from '@angular/core';
import {CategoryService, Category} from '../../services/category.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  imports: [CommonModule]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  error: string = '';

  constructor(
    private categoryService: CategoryService,
  ) {
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: data => this.categories = data,
      error: () => this.error = 'Error fetching categories'
    });
  }

}
