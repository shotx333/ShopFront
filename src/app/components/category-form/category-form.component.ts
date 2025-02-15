import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
    imports: [ReactiveFormsModule, CommonModule]
  
})
export class CategoryFormComponent {
  categoryForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  createCategory(): void {
    if (this.categoryForm.invalid) {
      this.error = 'Category name is required.';
      return;
    }
    this.categoryService.createCategory(this.categoryForm.value).subscribe({
      next: () => this.router.navigate(['/categories']),
      error: () => this.error = 'Error creating category'
    });
  }
}
