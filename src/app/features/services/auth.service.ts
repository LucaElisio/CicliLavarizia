import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from "../../../environments/environment"
import { LoginRequest } from '../../shared/models/authModel';
import { Observable, tap } from 'rxjs';
import { TokenResponse } from '../../shared/models/tokenModel';

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

  changeAuthState() {
    const token = localStorage.getItem('token');
    if (token) {
      this.isAuthenticated.set(true);
    } else {
      this.isAuthenticated.set(false);
    }
  }

}
