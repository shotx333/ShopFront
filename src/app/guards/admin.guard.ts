import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import baseUrl from '../services/helper';



@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private adminCheckUrl = `${baseUrl}/auth/admin-check`;

  constructor(
    private http: HttpClient, 
    private router: Router,


  ) {}

  canActivate(): Observable<boolean> {
    return this.http.get(this.adminCheckUrl, { observe: 'response' }).pipe(
      map(response => {
        return response.status === 200;
      }),
      catchError(error => {
        console.error('Admin guard error:', error);
        
        if (error.status === 401 || error.status === 403) {

        }
        
        this.router.navigate(['/']);
        return of(false);
      })
    );
  }
}
