import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductCategoryResponse, ProductResponse } from '../models/productModel';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {

  private http = inject(HttpClient)
  private url = environment.apiUrl;

  getCategories(): Observable<ProductCategoryResponse[]> {
    return this.http.get<ProductCategoryResponse[]>(`${this.url}/Product/GetAllCategories`);
  }

  getProducts(page: number, pageSize: number, category: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.url}/Product/GetProducts`, {
      params: {
        page: page, pageSize: pageSize, category: category
      }
    });
  }

  getRandomProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.url}/Product/GetRandomProducts`);
  }

}
