import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable } from 'rxjs';
import { CartResponse } from '../models/cartModel';
import { ProductService } from './product.service';
import { SaleResponse } from '../models/saleModel';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
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

   createOrder(orderData: SaleResponse): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(`${this.url}/Sales/CreateSalesOrder`, orderData);
   }

   showOrder(): Observable<SaleResponse> {
    return this.http.get<SaleResponse>(`${this.url}/Sales/GetCustomerOrders`);
   }
}   