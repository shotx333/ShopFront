import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Removed direct dependency on AuthEventService


@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  constructor() {} // Removed AuthEventService from constructor


  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized and 403 Forbidden responses
        if ([401, 403].includes(error.status)) {
          // Notify about auth error without direct dependency on AuthService
          // Notify about auth error without direct dependency on AuthEventService
          // Consider using a different approach to handle this

        }
        return throwError(() => error);
      })
    );
  }
}
