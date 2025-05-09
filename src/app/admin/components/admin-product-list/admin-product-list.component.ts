import { Component, ElementRef, ViewChild } from '@angular/core';
import { Product, ProductService } from '../../../services/product.service';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import baseUrl from '../../../services/helper';

@Component({
  selector: 'app-admin-product-list',
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
    NgClass,
    FormsModule
  ],
  templateUrl: './admin-product-list.component.html',
  styleUrl: './admin-product-list.component.scss'
})
export class AdminProductListComponent {
  @ViewChild('newImageInput') newImageInput!: ElementRef;

  products: Product[] = [];
  error: string = '';
  showStockModal: boolean = false;
  showPriceModal: boolean = false;
  showImagesModal: boolean = false;
  selectedProduct: Product | null = null;
  newStockValue: number = 0;
  newPriceValue: number = 0;
  makeNewImagePrimary: boolean = false;

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

  openPriceUpdateModal(product: Product): void {
    this.selectedProduct = product;
    this.newPriceValue = product.price;
    this.showPriceModal = true;
  }

  closePriceModal(): void {
    this.showPriceModal = false;
    this.selectedProduct = null;
  }

  updateStock(): void {
    if (!this.selectedProduct) return;

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

  updatePrice(): void {
    if (!this.selectedProduct) return;

    // Validate price
    if (this.newPriceValue < 0.01) {
      this.error = 'Price must be at least 0.01';
      return;
    }

    const updatedProduct: Product = {
      ...this.selectedProduct,
      price: this.newPriceValue
    };

    this.productService.updateProduct(this.selectedProduct.id!, updatedProduct).subscribe({
      next: () => {
        this.closePriceModal();
        this.loadProducts();
        alert('Price updated successfully');
      },
      error: (err) => {
        this.error = err.error || 'Error updating price';
      }
    });
  }

  manageProductImages(product: Product): void {
    this.selectedProduct = product;
    this.showImagesModal = true;
    this.makeNewImagePrimary = false;
  }

  closeImagesModal(): void {
    this.showImagesModal = false;
    this.selectedProduct = null;
  }

  setAsPrimaryImage(productId: number, imageId: number): void {
    this.productService.setPrimaryProductImage(productId, imageId).subscribe({
      next: (updatedProduct) => {
        this.selectedProduct = updatedProduct;

        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
      },
      error: () => {
        this.error = 'Error setting primary image';
      }
    });
  }

  deleteProductImage(productId: number, imageId: number): void {
    if (confirm('Are you sure you want to delete this image?')) {
      this.productService.deleteProductImage(productId, imageId).subscribe({
        next: (updatedProduct) => {
          this.selectedProduct = updatedProduct;

          const index = this.products.findIndex(p => p.id === productId);
          if (index !== -1) {
            this.products[index] = updatedProduct;
          }
        },
        error: () => {
          this.error = 'Error deleting image';
        }
      });
    }
  }

  addNewImage(productId: number, fileInput: HTMLInputElement): void {
    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Please select an image file to upload');
      return;
    }

    const file = fileInput.files[0];

    this.productService.addProductImage(productId, file, this.makeNewImagePrimary).subscribe({
      next: (updatedProduct) => {
        this.selectedProduct = updatedProduct;

        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }

        fileInput.value = '';
        this.makeNewImagePrimary = false;
      },
      error: () => {
        this.error = 'Error uploading image';
      }
    });
  }

  protected readonly baseUrl = baseUrl;
}