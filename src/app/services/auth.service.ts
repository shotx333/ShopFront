import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken';
  private authUrl = 'http://localhost:8080/auth';
  public currentUserRole = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    // Send credentials in the body instead of as query parameters.

    return this.http.post(
      `${this.authUrl}/login`,
      { username, password },  // <-- JSON body payload
      { responseType: 'text' } // expecting the token as text
    ).pipe(
      tap(token => {
        localStorage.setItem(this.tokenKey, token);
        // For demo purposes, assign role based on username.
        this.currentUserRole.next(username === 'shotx' ? 'ADMIN' : 'USER');
      })
    );
  }

   register(username: string, password: string): Observable<any> {
      // Send credentials in the body instead of as query parameters.
      return this.http.post(
        `${this.authUrl}/register`,
        { username, password },  // <-- JSON body payload
        { responseType: 'text' } // expecting the token as text
      ).pipe(
        tap(token => {
          localStorage.setItem(this.tokenKey, token);
          // For demo purposes, assign role based on username.
          this.currentUserRole.next(username === 'admin' ? 'ADMIN' : 'USER');
        })
      );
    }

  // register(username: string, password: string, role: string)
  // register(username: string, password: string)

  // : Observable<any> {
  //   return this.http.post(`${this.authUrl}/register`, { username, password }, { params: { username, password } });
  // }

  logout(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.http.post(`${this.authUrl}/logout`, null, { headers: { 'Authorization': token } }).subscribe();
    }
    localStorage.removeItem(this.tokenKey);
    this.currentUserRole.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
