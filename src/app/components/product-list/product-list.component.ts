import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NgForOf, NgIf, NgClass, CommonModule } from '@angular/common';
import { CategoryService, Category } from '../../services/category.service';
import { ActivatedRoute, Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import baseUrl from '../../services/helper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
    FormsModule,
    RouterLink
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: ProductWithQuantity[] = [];
  isLoggedIn: boolean = false;

  filteredProducts: ProductWithQuantity[] = [];
  categories: Category[] = [];
  selectedCategories: number[] = [];
  error: string = '';

  searchQuery: string = '';
  searchActive: boolean = false;
  
  private lastSearchQuery: string = '';
  protected isSearching: boolean = false;
  
  private routerSubscription: Subscription | null = null;
  private queryParamSubscription: Subscription | null = null;

  fullImageUrl: string | null = null;
  fullImageAlt: string = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadCategories();
    
    this.queryParamSubscription = this.route.queryParams.subscribe(params => {
      let needsDataRefresh = false;
      
      if (params['categoryId']) {
        const categoryId = Number(params['categoryId']);
        if (categoryId === 0) {
          this.selectedCategories = [];
        } else {
          this.selectedCategories = [categoryId];
        }
        needsDataRefresh = true;
      }
      
      if (params['query'] && params['query'] !== this.lastSearchQuery) {
        this.searchQuery = params['query'];
        this.lastSearchQuery = params['query'];
        this.searchActive = true;
        needsDataRefresh = true;
      }
      
      if (needsDataRefresh) {
        if (this.searchActive) {
          this.searchProducts(false);
        } else {
          this.loadProducts();
        }
      }
    });
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.includes('/products') && !this.router.url.includes('?')) {
          this.searchQuery = '';
          this.lastSearchQuery = '';
          this.searchActive = false;
          this.loadProducts();
        }
      });
      
    if (!this.searchActive) {
      this.loadProducts();
    }
  }
  
  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.queryParamSubscription) {
      this.queryParamSubscription.unsubscribe();
    }
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
    if (this.isSearching) return;
    
    this.productService.getProducts().subscribe({
      next: data => {
        this.products = data.map(product => {
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

  searchProducts(updateUrl: boolean = true) {
    if (this.isSearching || (this.searchQuery === this.lastSearchQuery && this.searchActive)) {
      return;
    }
    
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      this.searchActive = false;
      this.lastSearchQuery = '';
      this.loadProducts();
      
      if (updateUrl) {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { query: null },
          queryParamsHandling: 'merge'
        });
      }
      return;
    }
    
    this.searchActive = true;
    this.isSearching = true;
    this.lastSearchQuery = this.searchQuery;
    
    const categoryIds = this.selectedCategories.length > 0 ? this.selectedCategories : undefined;
    
    this.productService.searchProducts(this.searchQuery, categoryIds).subscribe({
      next: data => {
        if (updateUrl) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { query: this.searchQuery },
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        }
        
        this.products = data.map(product => {
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
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error searching products', err);
        this.error = 'Error searching products. Please try again later.';
        this.isSearching = false;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.lastSearchQuery = '';
    this.searchActive = false;
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { query: null },
      queryParamsHandling: 'merge'
    });
    
    this.loadProducts();
  }

  isAllCategoriesSelected(): boolean {
    return this.selectedCategories.length === 0;
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  toggleAllCategories(): void {
    if (this.isAllCategoriesSelected()) {
      this.selectedCategories = this.categories.map(c => c.id!);
    } else {
      this.selectedCategories = [];
    }
    this.filterProducts();
    
    if (this.searchActive) {
      this.searchProducts();
    }
  }

  toggleCategory(categoryId: number): void {
    if (this.isCategorySelected(categoryId)) {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.filterProducts();
    
    if (this.searchActive) {
      this.searchProducts();
    }
  }

  clearFilters(): void {
    this.selectedCategories = [];
    this.filterProducts();
    
    if (this.searchActive) {
      this.searchProducts();
    }
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
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(
        product => product.category && this.selectedCategories.includes(product.category.id!)
      );
    }
  }

  validateQuantity(product: ProductWithQuantity) {
    if (!product.quantityToAdd || product.quantityToAdd < 1) {
      product.quantityToAdd = 1;
    }

    if (product.stock !== undefined && product.quantityToAdd > product.stock) {
      product.quantityToAdd = product.stock;
    }
  }

  addToCart(product: ProductWithQuantity) {
    const quantity = product.quantityToAdd || 1;

    if (product.stock === undefined || product.stock < quantity) {
      alert('Not enough stock available');
      return;
    }

    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    this.isLoggedIn = localStorage.getItem('authToken') !== null;

    if (!this.isLoggedIn) {
      alert('Please log in to add items to your cart.');
      return;
    }
    
    this.cartService.addItem(product.id!, quantity).subscribe({
      next: () => {
        alert(`${quantity} ${product.name}(s) added to cart.`);
        this.loadProducts();
      },
      error: (err) => alert(err.error || 'Error adding product to cart.')
    });
  }

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

  openFullImage(product: ProductWithQuantity, imageIndex: number): void {
    if (product.images && product.images.length > 0) {
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