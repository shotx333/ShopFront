import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  imports: [ReactiveFormsModule,CommonModule]
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  selectedFile: File | null = null;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: [''],
      description: [''],
      price: [''],
      categoryId: ['']
    });
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: data => this.categories = data,
      error: () => this.error = 'Error fetching categories'
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  createProduct() {
    const formValue = this.productForm.value;
    const product: Product = {
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      category: { id: Number(formValue.categoryId), name: '' } // Only ID is needed
    };
    this.productService.createProduct(product).subscribe({
      next: (createdProduct) => {
        if (this.selectedFile) {
          // After product creation, upload the image file.
          this.productService.uploadImage(createdProduct.id!, this.selectedFile).subscribe({
            next: () => this.router.navigate(['/products']),
            error: () => this.error = 'Product created but image upload failed'
          });
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: () => this.error = 'Error creating product'
    });
  }
}
