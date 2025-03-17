import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';

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
  paymentStatus?: string;
  paymentIntentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersUrl = `${baseUrl}/orders`;

  constructor(private http: HttpClient) { }

  placeOrder(orderItems: OrderItem[]): Observable<any> {
    return this.http.post<any>(this.ordersUrl, orderItems);
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.ordersUrl);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.ordersUrl}/${id}`);
  }

  // Changed from PATCH to POST to avoid CORS issues
  updateOrderPaymentStatus(id: number, status: string): Observable<Order> {
    return this.http.post<Order>(`${this.ordersUrl}/${id}/payment-status`, null, {
      params: { status }
    });
  }
  protected readonly baseurl = baseUrl;

}
