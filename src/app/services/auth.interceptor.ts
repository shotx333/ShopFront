import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {} // Use Injector instead of directly injecting AuthService

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lazily retrieve AuthService to break the dependency cycle.
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();
    
    if (token) {
      // Clone the request and add the Authorization header.
      const cloned = req.clone({
        headers: req.headers.set('Authorization', token)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
