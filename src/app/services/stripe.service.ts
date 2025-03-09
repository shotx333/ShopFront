import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http: HttpClient) { }

  createPaymentIntent(orderId: number): Observable<any> {
    return this.http.post<any>(`${baseUrl}/payment/create-payment-intent/${orderId}`, {});
  }

}
