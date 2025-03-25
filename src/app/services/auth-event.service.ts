import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthEventService {
  // Event for auth errors (401, 403)
  private authErrorSubject = new Subject<void>();
  authError$ = this.authErrorSubject.asObservable();

  // Notify about authentication errors
  notifyAuthError(): void {
    this.authErrorSubject.next();
  }
}