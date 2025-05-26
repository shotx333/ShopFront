import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthEventService {
  private authEvents$ = new Subject<void>();
  private authErrorSubject = new Subject<void>();
  authError$ = this.authErrorSubject.asObservable();

  notifyAuthError(): void {
    this.authErrorSubject.next();
  }
  /** Push a new auth-related event */
  sendAuthEvent(): void {
    this.authEvents$.next();
  }

  /** Observable stream consumers can subscribe to */
  getAuthEvents(): Observable<void> {
    return this.authEvents$.asObservable();
  }
}
