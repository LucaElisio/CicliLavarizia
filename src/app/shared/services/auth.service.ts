import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, UpdateEmailRequest } from '../models/authModel';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenDecoded, TokenResponse } from '../models/tokenModel';
import { jwtDecode } from 'jwt-decode';
import { CustomerInfoRequest } from '../models/customerModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private url = environment.apiUrl;

  public isAuthenticated = signal<boolean>(false);
  public userInfo = signal<TokenDecoded | null>(null);
  public customerInfo = signal<CustomerInfoRequest | null>(null);
  isRefreshing = false;
  refreshSubject = new BehaviorSubject<string | null>(null);

  login(userData: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/Auth/Login`, userData, {
      withCredentials: true,
    });
  }

  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/Auth/Register`, userData);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/Auth/Logout`, {}, { withCredentials: true });
  }

  refresh(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/Auth/Refresh`, {}, { withCredentials: true });
  }

  delete(): Observable<void> {
    return this.http.delete<void>(`${this.url}/Auth/Delete`);
  }

  updateEmail(newEmail: UpdateEmailRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/Auth/UpdateEmailAddress`, newEmail, {
      withCredentials: true,
    });
  }

  updatePassword(userData: LoginRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/Auth/RefreshPassword`, userData);
  }

  changeAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.set(true);
      this.userInfo.set(jwtDecode(token));
    } else {
      this.isAuthenticated.set(false);
      this.userInfo.set(null);
    }
  }
}
