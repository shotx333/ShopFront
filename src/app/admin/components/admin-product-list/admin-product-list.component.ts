import { Component } from '@angular/core';
import { Product, ProductService } from '../../../services/product.service';
import { NgForOf, NgIf, NgOptimizedImage, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import baseUrl from '../../../services/helper';

@Component({
  selector: 'app-admin-product-list',
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
    NgOptimizedImage,
    NgClass,
    FormsModule
  ],
  templateUrl: './admin-product-list.component.html',
  styleUrl: './admin-product-list.component.scss'
})
export class AdminProductListComponent {
  products: Product[] = [];
  error: string = '';
  showStockModal: boolean = false;
  selectedProduct: Product | null = null;
  newStockValue: number = 0;

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
  
  openStockUpdateModal(product: Product): void {
    this.selectedProduct = product;
    this.newStockValue = product.stock || 0;
    this.showStockModal = true;
  }
  
  closeStockModal(): void {
    this.showStockModal = false;
    this.selectedProduct = null;
  }
  
  updateStock(): void {
    if (!this.selectedProduct) return;
    
    // Create a copy of the product with updated stock
    const updatedProduct: Product = {
      ...this.selectedProduct,
      stock: this.newStockValue
    };
    
    this.productService.updateProduct(this.selectedProduct.id!, updatedProduct).subscribe({
      next: () => {
        this.closeStockModal();
        this.loadProducts();
        alert('Stock updated successfully');
      },
      error: () => {
        this.error = 'Error updating stock';
      }
    });
  }

  protected readonly baseUrl = baseUrl;
}