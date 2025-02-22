import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private adminCheckUrl = 'http://localhost:8080/auth/admin-check';

  constructor(private http: HttpClient, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.http.get(this.adminCheckUrl, { observe: 'response' }).pipe(
      map(response => {
        // If backend returns 200, allow access.
        return response.status === 200;
      }),
      catchError(() => {
        // Redirect non-admin users to home.
        this.router.navigate(['/']).then(r => {});
        return of(false);
      })
    );
  }
}
