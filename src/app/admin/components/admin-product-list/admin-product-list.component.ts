import { Component } from '@angular/core';
import {Product, ProductService} from '../../../services/product.service';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {RouterLink} from '@angular/router';
import baseUrl from '../../../services/helper';

@Component({
  selector: 'app-admin-product-list',
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './admin-product-list.component.html',
  styleUrl: './admin-product-list.component.scss'
})
export class AdminProductListComponent {
  products: Product[] = [];
  error: string = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: () => this.error = 'Error fetching products'
    });
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          alert('Product deleted successfully.');
          this.loadProducts();
        },
        error: () => alert('Error deleting product.')
      });
    }
  }

  protected readonly baseUrl = baseUrl;
}
