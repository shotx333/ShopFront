import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderItem {
  id?: number;
  productId: number;
  quantity: number;
  price?: number;
}

export interface Order {
  id?: number;
  username?: string;
  createdAt?: string;
  items: OrderItem[];
  totalPrice?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://localhost:8080/orders';

  constructor(private http: HttpClient) { }

  placeOrder(orderItems: OrderItem[]): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, orderItems);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }
}
