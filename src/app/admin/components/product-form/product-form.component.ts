import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService, Product, ProductImage } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
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

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.productImages.push(file);

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
      category: { id: Number(formValue.categoryId), name: '' } 
    };

    this.productService.createProduct(product).subscribe({
      next: (createdProduct) => {
        this.uploadImages(createdProduct.id!, 0);
      },
      error: () => this.error = 'Error creating product'
    });
  }

  private uploadImages(productId: number, index: number) {
    if (index >= this.productImages.length) {
      this.router.navigate(['admin/products']);
      return;
    }

    const file = this.productImages[index];
    const isPrimary = index === this.primaryImageIndex;

    this.productService.addProductImage(productId, file, isPrimary).subscribe({
      next: () => {
        this.uploadImages(productId, index + 1);
      },
      error: () => {
        this.error = `Error uploading image ${index + 1}`;
        this.uploadImages(productId, index + 1);
      }
    });
  }
}