import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {} 

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const authService = this.injector.get(AuthService);
    const token = authService.getToken();
    
    if (token) {
      
      const cloned = req.clone({
        headers: req.headers.set('Authorization', token)
      });
      return next.handle(cloned);
    }
    
    return next.handle(req);
  }
}
