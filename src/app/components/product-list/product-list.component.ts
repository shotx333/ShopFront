// src/app/components/product-list/product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import baseUrl from '../../services/helper';

interface ProductWithQuantity extends Product {
  quantityToAdd?: number;
}

@Component({
  selector: 'app-product-list',
  imports: [
    NgIf,
    NgOptimizedImage,
    NgForOf,
    FormsModule
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: ProductWithQuantity[] = [];
  error: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: data => {
        this.products = data.map(product => ({
          ...product,
          quantityToAdd: 1
        }));
        this.error = '';
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.error = 'Please log in';
        } else {
          this.error = 'Error fetching products';
        }
      }
    });
  }

  validateQuantity(product: ProductWithQuantity) {
    if (!product.quantityToAdd || product.quantityToAdd < 1) {
      product.quantityToAdd = 1;
    }
  }

  addToCart(product: ProductWithQuantity) {
    const quantity = product.quantityToAdd || 1;
    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    this.cartService.addItem(product.id!, quantity).subscribe({
      next: () => alert(`${quantity} ${product.name}(s) added to cart.`),
      error: (err) => alert(err.error || 'Error adding product to cart.')
    });
  }

  protected readonly baseUrl = baseUrl;
}
