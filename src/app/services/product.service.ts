import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

export interface ProductImage {
  id?: number;
  imageUrl: string;
  primary?: boolean;
  displayOrder?: number;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category: Category;
  imageUrl?: string;
  images?: ProductImage[];
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

  // Upload a primary image for a product (legacy method)
  uploadImage(productId: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.baseUrl}/${productId}/upload-image`, formData);
  }

  // Add an additional image to a product
  addProductImage(productId: number, file: File, isPrimary: boolean = false): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('primary', isPrimary.toString());
    return this.http.post<Product>(`${this.baseUrl}/${productId}/images`, formData);
  }

  // Delete a product image
  deleteProductImage(productId: number, imageId: number): Observable<Product> {
    return this.http.delete<Product>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  // Set an image as the primary product image
  setPrimaryProductImage(productId: number, imageId: number): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${productId}/images/${imageId}/primary`, {});
  }

  // Reorder product images
  reorderProductImages(productId: number, imageIds: number[]): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${productId}/images/reorder`, imageIds);
  }
}
