import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import baseUrl from '../../services/helper';

@Component({
  selector: 'app-product-list',
  imports: [
    NgIf,
    NgOptimizedImage,
    NgForOf
  ],
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
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
        this.products = data;
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

  addToCart(product: Product) {
    this.cartService.addItem(product.id!, 1).subscribe({
      next: () => alert(`${product.name} added to cart.`),
      error: () => alert('Error adding product to cart.')
    });
  }

  protected readonly baseUrl = baseUrl;
}
