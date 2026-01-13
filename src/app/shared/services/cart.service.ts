import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable, of, catchError, firstValueFrom, concatMap, from } from 'rxjs';
import { CartResponse } from '../models/cartModel';
import { ProductService } from './product.service';

interface LocalCartItem {
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private productService = inject(ProductService);

  private url = environment.apiUrl;
  private localCartKey = 'localCart';

  cartProducts = signal<CartResponse | null>(null);
  localCartItems = signal<LocalCartItem[]>(this.initLocalCart());

  // Inizializza il carrello locale dal localStorage
  private initLocalCart(): LocalCartItem[] {
    const cart = localStorage.getItem(this.localCartKey);
    return cart ? JSON.parse(cart) : [];
  }

  // Gestione carrello locale
  getLocalCart(): LocalCartItem[] {
    const cart = localStorage.getItem(this.localCartKey);
    const parsedCart = cart ? JSON.parse(cart) : [];
    this.localCartItems.set(parsedCart);
    return parsedCart;
  }

  saveLocalCart(cart: LocalCartItem[]): void {
    localStorage.setItem(this.localCartKey, JSON.stringify(cart));
    this.localCartItems.set(cart);
  }

  addToLocalCart(productId: number, quantity: number): void {
    const cart = this.getLocalCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    
    this.saveLocalCart(cart);
  }

  removeFromLocalCart(productId: number): void {
    const cart = this.getLocalCart().filter(item => item.productId !== productId);
    this.saveLocalCart(cart);
  }

  updateLocalCartQuantity(productId: number, newQuantity: number): void {
    const cart = this.getLocalCart();
    const item = cart.find(item => item.productId === productId);
    
    if (item) {
      item.quantity = newQuantity;
      this.saveLocalCart(cart);
    }
  }

  clearLocalCart(): void {
    localStorage.removeItem(this.localCartKey);
    this.localCartItems.set([]);
  }

  // Trasferisce il carrello locale al DB
  mergeLocalCartToServer(): Observable<void> {
    const localCart = this.getLocalCart();
    
    if (localCart.length === 0) {
      return of(void 0);
    }

    console.log('Merging local cart to server:', localCart);

    // Esegui le chiamate in sequenza per evitare race conditions
    return from(localCart).pipe(
      concatMap(item => {
        console.log(`Adding product ${item.productId} with quantity ${item.quantity}`);
        return this.addToCart(item.productId, item.quantity);
      }),
      map(() => {
        console.log('All items added, clearing local cart');
        this.clearLocalCart();
      }),
      catchError(err => {
        console.error('Error merging cart:', err);
        throw err;
      })
    );
  }

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



  isInCart(productId: number): boolean {
    return this.cartProducts()?.products.some(p => p.productId === productId) ?? false;
  }

  itemCount(productId: number): number {
    let count = 0;

    for (let item of this.cartProducts()?.products ?? []) {
      if (item.productId === productId) {
        count += 1;
      }
    }
    return count;
  }

  removeFromCart(productId: number): Observable<void> {
    return this.http.put<void>(`${this.url}/Cart/RemoveItemFromCart/${productId}`, {});
  }
}