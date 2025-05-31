import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import baseUrl from './helper';
import { AuthEventService } from './auth-event.service';


interface RegisterDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  birthYear: number;
}

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


login(username: string, password: string): Observable<void> {
  return this.http.post(
    `${baseUrl}/auth/login`,
    { username, password },

    /* tell HttpClient the response is plain text */
    { responseType: 'text' }          //  ← added
  ).pipe(
    tap((token: string) => {          // token is now the raw text
      this.setToken(token);
      this.startTokenValidationLoop();
      this.authEvent.sendAuthEvent();
    }),
    map(() => undefined)              // convert to Observable<void>
  );
}


register(dto: RegisterDto): Observable<void>{
  return this.http.post<void>(`${baseUrl}/auth/register`, dto);
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

  }
}
