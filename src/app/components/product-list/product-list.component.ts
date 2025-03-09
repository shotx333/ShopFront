import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NgForOf, NgIf, NgOptimizedImage, NgClass } from '@angular/common';
import { CategoryService, Category } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import baseUrl from '../../services/helper';
import {FormsModule} from '@angular/forms';

interface ProductWithQuantity extends Product {
  quantityToAdd?: number;
  activeImageIndex?: number;
}

@Component({
  selector: 'app-product-list',
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    FormsModule
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: ProductWithQuantity[] = [];
  filteredProducts: ProductWithQuantity[] = [];
  categories: Category[] = [];
  selectedCategoryId: number = 0; // 0 means all categories
  error: string = '';

  // For full-size image modal
  fullImageUrl: string | null = null;
  fullImageAlt: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();

    // Subscribe to query params to filter by category
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        this.selectedCategoryId = Number(params['categoryId']);
        this.filterByCategory();
      }
    });
  }

  // Method to get category name by ID
  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: data => {
        this.categories = data;
      },
      error: () => {
        // Just log the error but don't show it to user
        console.error('Error fetching categories');
      }
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: data => {
        this.products = data.map(product => ({
          ...product,
          quantityToAdd: product.stock && product.stock > 0 ? 1 : 0,
          activeImageIndex: 0
        }));
        this.filterByCategory();
        this.error = '';
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.error = 'Error loading products. Please try again later.';
      }
    });
  }

  filterByCategory() {
    if (this.selectedCategoryId === 0) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        product => product.category?.id === this.selectedCategoryId
      );
    }
  }

  validateQuantity(product: ProductWithQuantity) {
    if (!product.quantityToAdd || product.quantityToAdd < 1) {
      product.quantityToAdd = 1;
    }

    // Ensure quantity doesn't exceed available stock
    if (product.stock !== undefined && product.quantityToAdd > product.stock) {
      product.quantityToAdd = product.stock;
    }
  }

  addToCart(product: ProductWithQuantity) {
    const quantity = product.quantityToAdd || 1;

    // Validate quantity against stock
    if (product.stock === undefined || product.stock < quantity) {
      alert('Not enough stock available');
      return;
    }

    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      if (confirm('Please log in to add items to your cart. Would you like to log in now?')) {
        // Save current URL to redirect back after login
        localStorage.setItem('redirectUrl', this.router.url);
        this.router.navigate(['/login']);
      }
      return;
    }

    // User is logged in, proceed with adding to cart
    this.cartService.addItem(product.id!, quantity).subscribe({
      next: () => {
        alert(`${quantity} ${product.name}(s) added to cart.`);
        // Reload products to get updated stock information
        this.loadProducts();
      },
      error: (err) => alert(err.error || 'Error adding product to cart.')
    });
  }

  // Image carousel methods
  getActiveImageIndex(product: ProductWithQuantity): number {
    return product.activeImageIndex || 0;
  }

  setActiveImage(product: ProductWithQuantity, index: number): void {
    product.activeImageIndex = index;
  }

  prevImage(product: ProductWithQuantity): void {
    if (!product.images || product.images.length <= 1) return;

    const currentIndex = product.activeImageIndex || 0;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : product.images.length - 1;
    product.activeImageIndex = newIndex;
  }

  nextImage(product: ProductWithQuantity): void {
    if (!product.images || product.images.length <= 1) return;

    const currentIndex = product.activeImageIndex || 0;
    const newIndex = currentIndex < product.images.length - 1 ? currentIndex + 1 : 0;
    product.activeImageIndex = newIndex;
  }

  // Full image modal methods
  openFullImage(imageUrl: string, altText: string): void {
    this.fullImageUrl = imageUrl;
    this.fullImageAlt = altText;
  }

  closeFullImage(): void {
    this.fullImageUrl = null;
  }

  protected readonly baseUrl = baseUrl;
}
