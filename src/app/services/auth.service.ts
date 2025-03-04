import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import baseUrl from './helper';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private tokenExpirationTimer: any;
  public currentUserRole = new BehaviorSubject<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      `${baseUrl}/auth/login`,
      { username, password },
      { responseType: 'text' }
    ).pipe(
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        // Assume token expires in 1 hour (3600 seconds)
        this.setLogoutTimer(3600 * 1000);
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
        // Assume token expires in 1 hour (3600 seconds)
        this.setLogoutTimer(3600 * 1000);
      })
    );
  }

  logout(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    localStorage.removeItem(this.tokenKey);
    this.currentUserRole.next(null);
    // Optionally, redirect to login here
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
}
