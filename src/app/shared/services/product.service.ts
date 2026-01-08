import { inject, Injectable, model } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductCategoryResponse, ProductResponse } from '../models/productModel';
import { HttpClient } from '@angular/common/http';
import { ProductModelsResponse } from '../models/productModelsResponse';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;
  modelId: number = 0;

  getCategories(): Observable<ProductCategoryResponse[]> {
    return this.http.get<ProductCategoryResponse[]>(`${this.url}/Product/GetAllCategories`);
  }

  getProducts(
    page: number,
    pageSize: number,
    category: string
  ): Observable<{ products: ProductResponse[]; totalProducts: number }> {
    return this.http
      .get<{ products: ProductResponse[]; totalProducts: number }>(
        `${this.url}/Product/GetProducts`,
        {
          params: { page, pageSize, category },
        }
      )
      .pipe(
        map((data) => ({
          ...data,
          products: data.products.map((p) => ({
            ...p,
            thumbNailPhoto: p.thumbNailPhoto
              ? 'data:image/gif;base64,' + this.hexToBase64(p.thumbNailPhoto)
              : undefined,
          })),
        }))
      );
  }

  getRandomProducts(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.url}/Product/GetRandomProducts`).pipe(
      map((products) =>
        products.map((p) => ({
          ...p,
          thumbNailPhoto: p.thumbNailPhoto
            ? 'data:image/gif;base64,' + this.hexToBase64(p.thumbNailPhoto)
            : undefined,
        }))
      )
    );
  }

  hexToBase64(input?: string): string {
    if (!input) return '';
    const hex = input.startsWith('0x') ? input.substring(2) : input;
    const binary = hex
      .match(/.{1,2}/g)!
      .map((b) => String.fromCharCode(parseInt(b, 16)))
      .join('');
    return btoa(binary);
  }

  getProductModels(
    page: number,
    pageSize: number,
    category: string
  ): Observable<ProductModelsResponse[]> {
    return this.http.get<ProductModelsResponse[]>(`${this.url}/Product/GetAllProductModels`, {
      params: {
        page: page,
        pageSize: pageSize,
        category: category,
      },
    });
  }

  searchProduct(productName: string): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.url}/product/SearchProductByName`, {
      params: {
        productName: productName,
      },
    });
  }
  getProductById(productId: number): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.url}/product/GetProduct`, {
      params: {
        productId: productId,
      },
    });
  }

}
