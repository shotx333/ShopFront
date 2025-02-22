import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import baseUrl from '../../services/helper';


@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  imports: [CommonModule, NgOptimizedImage]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  error: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: data => this.products = data,
      error: () => this.error = 'Error fetching products',
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
