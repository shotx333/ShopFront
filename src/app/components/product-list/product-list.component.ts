import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NgForOf, NgIf, NgOptimizedImage, NgClass } from '@angular/common';
import { CategoryService, Category } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
// Removed AuthService import
// Added isLoggedIn property


import baseUrl from '../../services/helper';
import { FormsModule } from '@angular/forms';

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
  isLoggedIn: boolean = false; // Default value for login status

  filteredProducts: ProductWithQuantity[] = [];
  categories: Category[] = [];
  selectedCategories: number[] = [];
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
    // Removed AuthService from constructor

  ) { }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();

    // Subscribe to query params to filter by category
    this.route.queryParams.subscribe(params => {
      if (params['categoryId']) {
        const categoryId = Number(params['categoryId']);
        // If categoryId is 0, clear selection, otherwise select just that category
        if (categoryId === 0) {
          this.selectedCategories = [];
        } else {
          this.selectedCategories = [categoryId];
        }
        this.filterProducts();
      }
    });
    
    // Subscribe to router events to refresh data when navigating to this component
    this.router.events.subscribe(() => {
      if (this.router.url.includes('/products')) {
        this.loadProducts();
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: data => {
        this.categories = data;
      },
      error: () => {
        console.error('Error fetching categories');
      }
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: data => {
        this.products = data.map(product => {
          // Find the primary image index to set as active by default
          let primaryIndex = 0;
          if (product.images && product.images.length > 0) {
            const primaryImageIndex = product.images.findIndex(img => img.primary);
            if (primaryImageIndex >= 0) {
              primaryIndex = primaryImageIndex;
            }
          }
          
          return {
            ...product,
            quantityToAdd: product.stock && product.stock > 0 ? 1 : 0,
            activeImageIndex: primaryIndex
          };
        });
        this.filterProducts();
        this.error = '';
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.error = 'Error loading products. Please try again later.';
      }
    });
  }

  // Category selection methods
  isAllCategoriesSelected(): boolean {
    return this.selectedCategories.length === 0; // No filters means all categories
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  toggleAllCategories(): void {
    if (this.isAllCategoriesSelected()) {
      // If all categories are already selected, select none
      this.selectedCategories = this.categories.map(c => c.id!);
    } else {
      // Otherwise clear selection to show all
      this.selectedCategories = [];
    }
    this.filterProducts();
  }

  toggleCategory(categoryId: number): void {
    if (this.isCategorySelected(categoryId)) {
      // Remove from selection
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    } else {
      // Add to selection
      this.selectedCategories.push(categoryId);
    }
    this.filterProducts();
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.filterProducts();
  }

  getSelectedCategoriesString(): string {
    return this.selectedCategories
      .map(categoryId => {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : '';
      })
      .filter(name => name)
      .join(', ');
  }

  filterProducts(): void {
    if (this.selectedCategories.length === 0) {
      // No filters, show all products
      this.filteredProducts = [...this.products];
    } else {
      // Filter by selected categories
      this.filteredProducts = this.products.filter(
        product => product.category && this.selectedCategories.includes(product.category.id!)
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

    // Check login status from local storage or another method
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; // Example check



    // User is logged in, proceed with adding to cart
    // Validate if user is logged in before adding to cart
    if (!this.isLoggedIn) {
      alert('Please log in to add items to your cart.');
      return;
    }
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

  // Updated Full image modal methods to use the correct image
  openFullImage(product: ProductWithQuantity, imageIndex: number): void {
    if (product.images && product.images.length > 0) {
      // Use the specific image that was clicked
      const imageUrl = baseUrl + product.images[imageIndex].imageUrl;
      this.fullImageUrl = imageUrl;
      this.fullImageAlt = product.name;
    }
  }

  closeFullImage(): void {
    this.fullImageUrl = null;
  }

  protected readonly baseUrl = baseUrl;
}
