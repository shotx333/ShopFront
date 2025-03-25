import { Component, OnInit, OnDestroy } from '@angular/core';
// Removed AuthService import
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category, CategoryService } from '../../services/category.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterLink]
})
export class NavbarComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  isLoggedIn: boolean = false;
  private authStatusSubscription: Subscription | null = null;

  constructor(
    // Removed AuthService from constructor
    private authService: AuthService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    
    // Subscribe to auth status changes
    // Implement a different approach to manage authentication status
    this.authStatusSubscription = this.authService.authStatus.subscribe(status => {
      this.isLoggedIn = status;
    });
    this.isLoggedIn = this.authService.isLoggedIn();

  }

  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => console.error('Error loading categories')
    });
  }

  logout() {
    // Implement logout functionality without AuthService
    this.authService.logout();
  }
}
