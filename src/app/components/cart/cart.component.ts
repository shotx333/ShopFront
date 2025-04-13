import { Component, OnInit } from '@angular/core';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  products: Map<number, Product> = new Map();
  error: string = '';
  showLoginPrompt: boolean = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    if (!this.authService.isLoggedIn()) {
      this.showLoginPrompt = true;

      return;
    }
    this.cartService.fetchCart().subscribe({
      next: (cart) => {
        this.cart = cart;

        if (cart && cart.items.length > 0) {
          const productIds = [...new Set(cart.items.map(item => item.productId))];
          const productRequests = productIds.map(id =>
            this.productService.getProduct(id)
          );

          forkJoin(productRequests).subscribe({
            next: (products) => {
              this.products.clear();
              products.forEach(product => {
                if (product && product.id) {
                  this.products.set(product.id, <Product>product);
                }
              });
            },
            error: () => this.error = 'Error loading product details'
          });
        }
      },
      error: () => this.error = 'Error loading cart'
    });
  }

  getProductInfo(productId: number): Product | undefined {
    return this.products.get(productId);
  }

  getProductPrice(productId: number): number {
    const product = this.products.get(productId);
    return product ? product.price : 0;
  }

  getItemSubtotal(item: CartItem): string {
    const price = this.getProductPrice(item.productId);
    const subtotal = price * item.quantity;
    return subtotal.toFixed(2);
  }

  getCartTotal(): string {
    if (!this.cart) return '0.00';

    const total = this.cart.items.reduce((total, item) => {
      const price = this.getProductPrice(item.productId);
      return total + (price * item.quantity);
    }, 0);
    
    return total.toFixed(2);
  }

  hasStockIssues(): boolean {
    if (!this.cart || !this.cart.items.length) return false;

    return this.cart.items.some(item => {
      const product = this.products.get(item.productId);
      return product && product.stock !== undefined && item.quantity > product.stock;
    });
  }

  validateQuantity(item: CartItem) {
    if (item.quantity < 1) {
      item.quantity = 1;
    }

    const product = this.products.get(item.productId);
    if (product && product.stock !== undefined && item.quantity > product.stock) {
    }
  }

  updateItem(productId: number, quantity: number) {
    if (quantity < 1) {
      quantity = 1;
    }

    this.cartService.updateItem(productId, quantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loadCart();
      },
      error: (err) => this.error = err.error || 'Error updating item'
    });
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId).subscribe({
      next: (cart) => this.cart = cart,
      error: () => this.error = 'Error removing item'
    });
  }

  placeOrder() {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.error = 'Cart is empty.';
      return;
    }

    if (this.hasStockIssues()) {
      this.error = 'Please update quantities - some items exceed available stock.';
      return;
    }

    const orderItems = this.cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    this.orderService.placeOrder(orderItems).subscribe({
      next: (response) => {
        this.router.navigate(['/checkout', response.order.id]);
      },
      error: (err) => this.error = err.error || 'Error placing order'
    });
  }
}