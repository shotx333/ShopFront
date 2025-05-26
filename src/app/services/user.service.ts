import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import baseUrl from './helper';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: this.auth.getToken() ?? '' });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${baseUrl}/users/me`, { headers: this.authHeaders() });
  }

  update(profile: Partial<User>): Observable<User> {
    return this.http.put<User>(`${baseUrl}/users/me`, profile,
      { headers: this.authHeaders() });
  }

  uploadAvatar(file: File): Observable<string> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${baseUrl}/users/me/avatar`, fd,
      { headers: this.authHeaders(), responseType: 'text' });
  }
}
