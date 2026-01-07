import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { CartResponse } from '../models/cartModel';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);

  private url = environment.apiUrl;

  cartProducts = signal<CartResponse | null>(null);

  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.url}/Cart/GetCart`).pipe(
      map((data) => ({
        ...data,
        products: data.products.map((p) => ({
          ...p,
          thumbNailPhoto: p.thumbNailPhoto
            ? 'data:image/gif;base64,' + this.productService.hexToBase64(p.thumbNailPhoto)
            : undefined,
        })),
      }))
    );
  }

  addToCart(productId: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.url}/Cart/AddToCart`, {
      productId: productId,
      quantity: quantity,
    });
  }
}