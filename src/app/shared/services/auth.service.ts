import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from "../../../environments/environment"
import { LoginRequest, RegisterRequest } from '../models/authModel';
import { Observable } from 'rxjs';
import { TokenDecoded, TokenResponse } from '../models/tokenModel';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private url = environment.apiUrl;

  public isAuthenticated = signal<boolean>(false)
  public userInfo = signal<TokenDecoded | null>(null);

  login(userData: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/Auth/Login`, userData, { withCredentials: true });
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
