import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CartResponse } from '../models/cartModel';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  cartProducts = signal<CartResponse | null>(null);

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.url}/Cart/GetCart`);
  }
}
