import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ProductService } from './product.service';
import { ProductCategoryResponse, ProductResponse } from '../models/productModel';
import { ProductDiscount } from '../models/discountModel';
import { ProductModelsResponse } from '../models/productModelsResponse';

@Injectable({
  providedIn: 'root',
})
export class SaleService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);

  private url = environment.apiUrl;

//   Crud prodotti
    insertProduct(productData: ProductResponse): Observable<ProductResponse> {
        return this.http.post<ProductResponse>(`${this.url}/SalesAssistant/Inserisci%20prodotto`, productData);
    }

    updateProduct(productId: number, productUpdate: ProductResponse): Observable<ProductResponse> {
        return this.http.put<ProductResponse>(`${this.url}/SalesAssistant/Aggiorna%20prodotto${productId}`, productUpdate);
    }

    removeSingleProduct(productId: number): Observable<void> {
        return this.http.delete<void>(`${this.url}/SalesAssistant/Rimuovi%20singolo%20prodotto${productId}`);
    }
    

    // Crud categoria
    insertCategory(category: ProductCategoryResponse): Observable<ProductCategoryResponse> {
      return this.http.post<ProductCategoryResponse>(`${this.url}/SalesAssistant/Inserisci%20categoria`, category);
    }

    updateCategory(categoryId: number, categoryName: string): Observable<boolean> {
      return this.http.put<boolean>(`${this.url}/SalesAssistant/Aggiorna%20categoria${categoryId}`, { categoryName });
    }

    deleteCategory(categoryId: number): Observable<boolean> {
      return this.http.delete<boolean>(`${this.url}/SalesAssistant/Rimuovi%20categoria${categoryId}`);
    }

    getCategoryIdByName(categoryName: string): Observable<number> {
      return this.http.get<number>(`${this.url}/SalesAssistant/Ottieni%20categoria%20dal%20nome${encodeURIComponent(categoryName)}`);
    }

    // All categories sta nel product service

    // Crud sconti
    insertDiscount(discount: ProductDiscount): Observable<ProductDiscount> {
      return this.http.post<ProductDiscount>(`${this.url}/SalesAssistant/Inserisci%20sconto`, discount);
    }

    updateDiscount(discountId: number, discount: ProductDiscount): Observable<boolean> {
      return this.http.put<boolean>(`${this.url}/SalesAssistant/Aggiorna%20sconto${discountId}`, discount);
    }

    deleteDiscount(discountId: number): Observable<boolean> {
      return this.http.delete<boolean>(`${this.url}/SalesAssistant/Rimuovi%20sconto${discountId}`);
    }

    getDiscounts(): Observable<ProductDiscount[]> {
      return this.http.get<ProductDiscount[]>(`${this.url}/SalesAssistant/Mostra%20sconti%20disponibili`);
    }

    getDiscountIdByName(discountCode: string): Observable<number> {
      return this.http.get<number>(`${this.url}/SalesAssistant/Ottieni%20sconto%20dal%20nome${encodeURIComponent(discountCode)}`);
    }

    // Crud modelli prodotti
    insertProductModel(newProductModel: ProductModelsResponse): Observable<ProductModelsResponse> {
      return this.http.post<ProductModelsResponse>(`${this.url}/SalesAssistant/Inserisci%20modello%20prodotto`, newProductModel);
    }

    updateProductModel(productModelId: number, modelName: string): Observable<boolean> {
      return this.http.put<boolean>(`${this.url}/SalesAssistant/Aggiorna%20modello%20prodotto${productModelId}`, { modelName });
    }

    updateProductDescription(productModel: string, description: string): Observable<boolean> {
      return this.http.put<boolean>(
        `${this.url}/SalesAssistant/Aggiorna%20descrizione%20prodotto${encodeURIComponent(productModel)}`,
        JSON.stringify(description),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    deleteProductModel(productModelId: number): Observable<boolean> {
      return this.http.delete<boolean>(`${this.url}/SalesAssistant/Rimuovi%20modello%20prodotto${productModelId}`);
    }

    getProductDescription(productModelId: number): Observable<string> {
      return this.http.get<string>(`${this.url}/SalesAssistant/Ottieni%20descrizione%20modello%20prodotto${productModelId}`);
    }

    getProductModels(): Observable<ProductModelsResponse[]> {
      return this.http.get<ProductModelsResponse[]>(`${this.url}/SalesAssistant/Mostra%20modelli%20prodotto`);
    }

    getProductModelIdByName(modelName: string): Observable<number> {
      return this.http.get<number>(`${this.url}/SalesAssistant/Ottieni%20modello%20dal%20nome${encodeURIComponent(modelName)}`);
    }
}