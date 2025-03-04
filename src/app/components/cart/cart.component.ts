import { Component, OnInit } from '@angular/core';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { forkJoin } from 'rxjs';

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

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.fetchCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        
        // If cart is not empty, load all product details
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
                  this.products.set(product.id, product);
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
  
  getItemSubtotal(item: CartItem): number {
    const price = this.getProductPrice(item.productId);
    return price * item.quantity;
  }
  
  getCartTotal(): number {
    if (!this.cart) return 0;
    
    return this.cart.items.reduce((total, item) => 
      total + this.getItemSubtotal(item), 0
    );
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
    
    // Ensure quantity doesn't exceed available stock
    const product = this.products.get(item.productId);
    if (product && product.stock !== undefined && item.quantity > product.stock) {
      // We don't automatically adjust it here to make the user aware
      // Will be highlighted as a warning instead
    }
  }

  updateItem(productId: number, quantity: number) {
    if (quantity < 1) {
      quantity = 1;
    }
    
    this.cartService.updateItem(productId, quantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loadCart(); // Reload to get fresh product data
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
    
    // Check for stock issues before placing order
    if (this.hasStockIssues()) {
      this.error = 'Please update quantities - some items exceed available stock.';
      return;
    }
    
    const orderItems = this.cart.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));
    
    this.orderService.placeOrder(orderItems).subscribe({
      next: () => {
        // Optionally, clear the cart on the backend or reload it.
        this.loadCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => this.error = err.error || 'Error placing order'
    });
  }
}