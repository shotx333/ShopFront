import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import baseUrl from '../../services/helper';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  error: string = '';
  isLoading: boolean = true;
  quantityToAdd: number = 1;
  isLoggedIn: boolean = false;
  
  // For image gallery/carousel
  activeImageIndex: number = 0;
  fullImageUrl: string | null = null;
  
  // Related products (could be products in the same category)
  relatedProducts: Product[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadProduct();
    
    // Check login status from local storage
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }

  loadProduct(): void {
    this.isLoading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.error = 'Product ID is missing';
      this.isLoading = false;
      return;
    }
    
    this.productService.getProduct(Number(id)).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
        
        // Set the active image to the primary image if it exists
        if (product.images && product.images.length > 0) {
          const primaryIndex = product.images.findIndex(img => img.primary);
          this.activeImageIndex = primaryIndex >= 0 ? primaryIndex : 0;
        }
        
        // Load related products (products in the same category)
        if (product.category?.id) {
          this.loadRelatedProducts(product.id!, product.category.id);
        }
        
        // Set page title
        document.title = `${product.name} | Shop`;
      },
      error: (err) => {
        console.error('Error loading product', err);
        this.error = 'Error loading product details. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  loadRelatedProducts(currentProductId: number, categoryId: number): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Filter products by category and exclude current product
        this.relatedProducts = products
          .filter(p => p.category?.id === categoryId && p.id !== currentProductId)
          .slice(0, 4); // Limit to 4 related products
      },
      error: () => {
        // Just silently fail, as related products are not critical
        this.relatedProducts = [];
      }
    });
  }
  
  validateQuantity(): void {
    if (!this.product) return;
    
    if (this.quantityToAdd < 1) {
      this.quantityToAdd = 1;
    }
    
    // Ensure quantity doesn't exceed available stock
    if (this.product.stock !== undefined && this.quantityToAdd > this.product.stock) {
      this.quantityToAdd = this.product.stock;
    }
  }
  
  addToCart(): void {
    if (!this.product) return;
    
    const quantity = this.quantityToAdd;
    
    // Validate quantity against stock
    if (this.product.stock === undefined || this.product.stock < quantity) {
      alert('Not enough stock available');
      return;
    }
    
    if (quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
    
    // Validate if user is logged in before adding to cart
    if (!this.isLoggedIn) {
      alert('Please log in to add items to your cart.');
      this.router.navigate(['/login'], { 
        queryParams: { redirectUrl: this.router.url } 
      });
      return;
    }
    
    this.cartService.addItem(this.product.id!, quantity).subscribe({
      next: () => {
        alert(`${quantity} ${this.product?.name}(s) added to cart.`);
        // Refresh product to get updated stock information
        this.loadProduct();
      },
      error: (err) => alert(err.error || 'Error adding product to cart.')
    });
  }
  
  // Image gallery/carousel methods
  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }
  
  prevImage(): void {
    if (!this.product?.images || this.product.images.length <= 1) return;
    
    this.activeImageIndex = this.activeImageIndex > 0 ? 
      this.activeImageIndex - 1 : this.product.images.length - 1;
  }
  
  nextImage(): void {
    if (!this.product?.images || this.product.images.length <= 1) return;
    
    this.activeImageIndex = this.activeImageIndex < this.product.images.length - 1 ? 
      this.activeImageIndex + 1 : 0;
  }
  
  openFullImage(index: number): void {
    if (!this.product?.images || !this.product.images[index]) return;
    
    this.fullImageUrl = baseUrl + this.product.images[index].imageUrl;
  }
  
  closeFullImage(): void {
    this.fullImageUrl = null;
  }
  
  // Navigation
  goToProductList(): void {
    // Go back to product list, optionally with category filter
    if (this.product?.category?.id) {
      this.router.navigate(['/products'], { 
        queryParams: { categoryId: this.product.category.id } 
      });
    } else {
      this.router.navigate(['/products']);
    }
  }
  
  goToProductDetail(productId: number): void {
    // Navigate to another product detail page
    this.router.navigate(['/products', productId]);
    // Refresh the component (as the router will reuse the component)
    setTimeout(() => this.loadProduct(), 0);
  }
  
  protected readonly baseUrl = baseUrl;
}