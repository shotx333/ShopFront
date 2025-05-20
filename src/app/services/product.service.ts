import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import baseUrl from './helper';

export interface Category {
  id: number;
  name: string;
}

export interface ProductImage {
  id?: number;
  imageUrl: string;
  isPrimary?: boolean;
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
  private productsUrl = `${baseUrl}/products`;

  constructor(private http: HttpClient) {
  }

  getProducts(): Observable<Product[]> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<Product[]>(this.productsUrl, {headers});
  }


  searchProducts(query?: string, categories?: number[]): Observable<Product[]> {
    let params = new HttpParams();

    if (query) {
      params = params.set('query', query);
    }

    if (categories && categories.length > 0) {

      categories.forEach(categoryId => {
        params = params.append('categories', categoryId.toString());
      });
    }

    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    return this.http.get<Product[]>(`${this.productsUrl}/search`, {
      headers,
      params
    });
  }


  getProduct(id: number): Observable<Product> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    return this.http.get<Product>(`${this.productsUrl}/${id}`, {headers});
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.productsUrl}/${id}`);
  }


  uploadImage(productId: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.productsUrl}/${productId}/upload-image`, formData);
  }


  addProductImage(productId: number, file: File, isPrimary: boolean = false): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary.toString());
    return this.http.post<Product>(`${this.productsUrl}/${productId}/images`, formData);
  }


  deleteProductImage(productId: number, imageId: number): Observable<Product> {
    return this.http.delete<Product>(`${this.productsUrl}/${productId}/images/${imageId}`);
  }


  setPrimaryProductImage(productId: number, imageId: number): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${productId}/images/${imageId}/primary`, {});
  }


  reorderProductImages(productId: number, imageIds: number[]): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${productId}/images/reorder`, imageIds);
  }

  protected readonly baseUrl = baseUrl;
}
