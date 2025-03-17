import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Product } from './product.service';
import baseUrl from './helper';

export interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
  // Optionally, add other fields if the backend returns them.
}

export interface Cart {
  id?: number;
  username?: string;
  items: CartItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartUrl = `${baseUrl}/cart`;
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Retrieve the cart from the backend.
  fetchCart(): Observable<Cart> {
    return this.http.get<Cart>(this.cartUrl).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // Add or update an item in the cart.
  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.cartUrl}/item`, null, {
      params: { productId: productId.toString(), quantity: quantity.toString() }
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // Remove an item from the cart.
  removeItem(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.cartUrl}/item`, {
      params: { productId: productId.toString() }
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  // Update an item’s quantity.
  updateItem(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.cartUrl}/item`, null, {
      params: { productId: productId.toString(), quantity: quantity.toString() }
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }
  protected readonly baseUrl = baseUrl;
}
