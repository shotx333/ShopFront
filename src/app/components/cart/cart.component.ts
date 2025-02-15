import { Component, OnInit } from '@angular/core';
import { CartService, Cart } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [CommonModule]
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  error: string = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.fetchCart().subscribe({
      next: (cart) => this.cart = cart,
      error: () => this.error = 'Error loading cart'
    });
  }

  // Toggle selection for order (if you want a selection mechanism, you can store it locally)
  // For simplicity, assume all items in the cart will be ordered if the user clicks the Place Order button.

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
    // In a more complete solution, you would let the user select which items to order.
    // For now, we send all cart items.
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
      error: () => this.error = 'Error placing order'
    });
  }
}
