import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from "../../../environments/environment"
import { LoginRequest, RegisterRequest } from '../../shared/models/authModel';
import { Observable } from 'rxjs';
import { TokenDecoded, TokenResponse } from '../../shared/models/tokenModel';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private url = environment.apiUrl;

  public isAuthenticated = signal<boolean>(false)

  login(userData: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.url}/Auth/Login`, userData, { withCredentials: true });
  }

  register(userData: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/Auth/Register`, userData);
  }

  getTokenInfo(): TokenDecoded {
    const token = localStorage.getItem('token');
    let tokenDecoded!: TokenDecoded;

    if (token) {
      tokenDecoded = jwtDecode(token);
    }
    return tokenDecoded;
  }

  changeAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.set(true);
    } else {
      this.isAuthenticated.set(false);
    }
  }

}
