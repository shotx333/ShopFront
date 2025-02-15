import { Component, OnInit } from '@angular/core';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  standalone:false
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  error: string = '';

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.orderService.getOrders().subscribe({
      next: data => this.orders = data,
      error: () => this.error = 'Error fetching orders'
    });
  }
}
