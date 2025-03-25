import { Component, OnInit } from '@angular/core';
import { OrderService, Order, OrderItem } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

import { CommonModule } from '@angular/common';
import { formatPrice, calculateItemTotal, formatTotalPrice } from '../../services/helper';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  imports: [CommonModule],
  standalone: true
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  error: string = '';

  showLoginPrompt: boolean = false;

  constructor(private orderService: OrderService, private authService: AuthService) { }


  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.showLoginPrompt = true;
      return;
    }

    this.orderService.getOrders().subscribe({

      next: data => this.orders = data,
      error: () => this.error = 'Error fetching orders'
    });
  }

  protected readonly formatPrice = formatPrice;
  protected readonly calculateItemTotal = calculateItemTotal;
  protected readonly formatTotalPrice = formatTotalPrice;
}
