import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import baseUrl from './helper';
import { AuthEventService } from './auth-event.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private tokenExpirationTimer: any;
  public currentUserRole = new BehaviorSubject<string | null>(null);
  public authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(
    private http: HttpClient,
    private router: Router,
    private authEventService: AuthEventService
  ) {
    
    this.checkTokenValidity();
    
    
    this.authEventService.authError$.subscribe(() => {
      if (this.isLoggedIn()) {
        console.log('Auth error received, logging out');
        this.logout();
      }
    });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      `${baseUrl}/auth/login`,
      { username, password },
      { responseType: 'text' }
    ).pipe(
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        
        this.setLogoutTimer(3600 * 1000);
        this.authStatus.next(true);
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(
      `${baseUrl}/auth/register`,
      { username, password },
      { responseType: 'text' }
    ).pipe(
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        
        this.setLogoutTimer(3600 * 1000);
        this.authStatus.next(true);
      })
    );
  }

  logout(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    
    const token = this.getToken();
    if (token) {
      
      this.http.post(`${baseUrl}/auth/logout`, {}, {
        headers: new HttpHeaders({
          'Authorization': token
        })
      }).subscribe({
        next: () => {},
        error: () => {}
      });
    }
    
    localStorage.removeItem(this.tokenKey);
    this.currentUserRole.next(null);
    this.authStatus.next(false);
    
    
    this.router.navigate(['/login']);
  }

  private setLogoutTimer(duration: number): void {
    this.tokenExpirationTimer = setTimeout(() => {
      alert('Session expired. Please log in again.');
      this.logout();
    }, duration);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  
  checkTokenValidity(): void {
    if (!this.isLoggedIn()) {
      this.authStatus.next(false);
      return;
    }

    
    this.http.get(`${baseUrl}/auth/admin-check`, { observe: 'response' }).pipe(
      catchError(error => {
        
        if (error.status === 401 || error.status === 403) {
          console.log('Token is invalid or expired, logging out');
          this.logout();
        }
        return throwError(() => error);
      })
    ).subscribe({
      next: () => {
        console.log('Token is valid');
        this.authStatus.next(true);
      },
      error: () => {}
    });
  }
}