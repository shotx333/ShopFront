import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, Product, ProductImage } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TwoDecimalBlockDirective } from '../../../two-decimal-block.directive';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  imports: [ReactiveFormsModule, CommonModule, TwoDecimalBlockDirective],
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  productImages: File[] = [];
  primaryImageIndex: number = 0;
  error: string = '';
  previewUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: data => this.categories = data,
      error: () => this.error = 'Error fetching categories'
    });
  }

  onFilesSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = event.target.files;

      // Add the new files to our array
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.productImages.push(file);

        // Create preview URLs
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  setPrimaryImage(index: number) {
    this.primaryImageIndex = index;
  }

  removeImage(index: number) {
    this.productImages.splice(index, 1);
    this.previewUrls.splice(index, 1);

    // Adjust primary image index if needed
    if (this.primaryImageIndex === index) {
      this.primaryImageIndex = 0;
    } else if (this.primaryImageIndex > index) {
      this.primaryImageIndex--;
    }
  }

  createProduct() {
    if (this.productForm.invalid) {
      this.error = 'Please fill all required fields correctly';
      return;
    }

    // Check if there's at least one image
    if (this.productImages.length === 0) {
      this.error = 'Please add at least one product image';
      return;
    }

    const formValue = this.productForm.value;
    const product: Product = {
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      category: { id: Number(formValue.categoryId), name: '' } // Only ID is needed
    };

    this.productService.createProduct(product).subscribe({
      next: (createdProduct) => {
        // Upload all images
        this.uploadImages(createdProduct.id!, 0);
      },
      error: () => this.error = 'Error creating product'
    });
  }

  // Recursive function to upload all images one by one
  private uploadImages(productId: number, index: number) {
    if (index >= this.productImages.length) {
      // All images uploaded, navigate to product list
      this.router.navigate(['admin/products']);
      return;
    }

    const file = this.productImages[index];
    const isPrimary = index === this.primaryImageIndex;

    this.productService.addProductImage(productId, file, isPrimary).subscribe({
      next: () => {
        // Upload next image
        this.uploadImages(productId, index + 1);
      },
      error: () => {
        this.error = `Error uploading image ${index + 1}`;
        // Continue with next image despite error
        this.uploadImages(productId, index + 1);
      }
    });
  }
}
