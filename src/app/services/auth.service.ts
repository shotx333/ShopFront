import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
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
  public authStatus      = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(
    private http: HttpClient,
    private router: Router,
    private authEvent: AuthEventService
  ) {}

  /* ------------------------------------------------ *
   *  TOKEN HELPERS
   * ------------------------------------------------ */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authStatus.next(true);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const token = this.getToken();
    if (token) {
      this.http.post(`${baseUrl}/auth/logout`, {}, {
        headers: new HttpHeaders({ Authorization: token })
      }).subscribe();
    }

    localStorage.removeItem(this.tokenKey);
    this.currentUserRole.next(null);
    this.authStatus.next(false);
    this.router.navigate(['/login']);
  }

  /* ------------------------------------------------ *
   *  LOGIN / REGISTER
   * ------------------------------------------------ */
  login(username: string, password: string): Observable<void> {
    return this.http.post<string>(`${baseUrl}/auth/login`, { username, password })
      .pipe(
        tap(token => {
          this.setToken(token);
          this.startTokenValidationLoop();
          this.authEvent.sendAuthEvent();
        }),
        /** convert the emitted token (string) to void for callers */
        map(() => undefined)
      );
  }

  register(username: string, email: string, password: string): Observable<void> {
    return this.http.post<void>(`${baseUrl}/auth/register`, { username, email, password });
  }

  /* ------------------------------------------------ *
   *  CHANGE-PASSWORD
   * ------------------------------------------------ */
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders({ Authorization: token ?? '' });

    return this.http.post<void>(
      `${baseUrl}/users/change-password`,
      { oldPassword, newPassword },
      { headers }
    );
  }

  /* ------------------------------------------------ *
   *  TOKEN-VALIDATION LOOP
   * ------------------------------------------------ */
  private startTokenValidationLoop(): void {
    const token = this.getToken();
    if (!token) { return; }

    const tokenLifespan = 60 * 60 * 1000; // 1 hour (Redis TTL)
    this.tokenExpirationTimer = setTimeout(() => this.logout(), tokenLifespan);

    this.http.get(`${baseUrl}/auth/admin-check`, { observe: 'response' })
      .pipe(
        catchError(err => {
          if (err.status === 401 || err.status === 403) {
            console.log('Token invalid/expired – logging out');
            this.logout();
          }
          return throwError(() => err);
        })
      ).subscribe({
      next : () => this.authStatus.next(true),
      error: () => {}
    });
  }
}
