import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category, CategoryService } from '../../services/category.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [CommonModule, RouterLink, FormsModule],
  standalone: true
})
export class NavbarComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  isLoggedIn: boolean = false;
  private authStatusSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  searchQuery: string = '';
  private lastSearchQuery: string = '';

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();

    this.authStatusSubscription = this.authService.authStatus.subscribe(status => {
      this.isLoggedIn = status;
    });
    this.isLoggedIn = this.authService.isLoggedIn();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const queryParam = urlParams.get('query');

        if (queryParam) {
          this.searchQuery = queryParam;
          this.lastSearchQuery = queryParam;
        } else if (!window.location.pathname.includes('/products')) {
          this.searchQuery = '';
          this.lastSearchQuery = '';
        }
      });
  }

  ngOnDestroy(): void {
    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: () => console.error('Error loading categories')
    });
  }

  logout() {
    this.authService.logout();
  }

  search(): void {
    const trimmedQuery = this.searchQuery.trim();

    if (trimmedQuery === this.lastSearchQuery || trimmedQuery === '') {
      return;
    }

    this.lastSearchQuery = trimmedQuery;

    this.router.navigate(['/products'], {
      queryParams: { query: trimmedQuery }
    });
  }
}
