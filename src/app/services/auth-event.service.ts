import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthEventService {
  
  private authErrorSubject = new Subject<void>();
  authError$ = this.authErrorSubject.asObservable();

  
  notifyAuthError(): void {
    this.authErrorSubject.next();
  }
}