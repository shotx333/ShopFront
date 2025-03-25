import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import baseUrl from '../services/helper'; // Added import for baseUrl



@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private adminCheckUrl = `${baseUrl}/auth/admin-check`;

  constructor(
    private http: HttpClient, 
    private router: Router,
    // Removed AuthEventService from constructor
    // baseUrl is now imported


  ) {}

  canActivate(): Observable<boolean> {
    return this.http.get(this.adminCheckUrl, { observe: 'response' }).pipe(
      map(response => {
        // If backend returns 200, allow access
        return response.status === 200;
      }),
      catchError(error => {
        console.error('Admin guard error:', error);
        
        // If unauthorized, notify of auth error
        if (error.status === 401 || error.status === 403) {
          // Handle unauthorized access without using AuthEventService

        }
        
        // Redirect non-admin users to home
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
