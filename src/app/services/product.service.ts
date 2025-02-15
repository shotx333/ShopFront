import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: Category;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // New method to upload an image for a product
  uploadImage(productId: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.baseUrl}/${productId}/upload-image`, formData);
  }

  getFullImageUrl(relativeUrl: string): string {
    return `http://localhost:8080${relativeUrl}`;
  }
  
}
