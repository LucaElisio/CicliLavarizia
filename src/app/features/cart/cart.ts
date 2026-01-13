import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Button } from "primeng/button";
import { RouterLink } from "@angular/router";
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../../shared/services/auth.service';
import { ProductService } from '../../shared/services/product.service';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [CardModule, CommonModule, Button, RouterLink, DividerModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);
  private confirmationService = inject(ConfirmationService);
  private authService = inject(AuthService);
  private productService = inject(ProductService);

  // Signal per i prodotti del carrello locale caricati dal server
  localCartProducts = signal<any[]>([]);
  isLoadingLocalCart = signal<boolean>(false);

  cartProducts = computed(() => this.cartService.cartProducts());
  totalElements = computed(() => {
    if (!this.authService.isAuthenticated()) {
      return this.localCartProducts().reduce((sum, p) => sum + p.quantity, 0);
    }
    return this.cartService.cartProducts()?.totalElements ?? 0;
  });
  
  totalPrice = computed(() => {
    if (!this.authService.isAuthenticated()) {
      return this.localCartProducts().reduce((sum, p) => sum + (p.listPrice * p.quantity), 0);
    }
    return this.cartService.cartProducts()?.totalAmount ?? 0;
  });

  // Raggruppa prodotti duplicati con quantità
  groupedProducts = computed(() => {
    if (!this.authService.isAuthenticated()) {
      return this.localCartProducts();
    }
    
    const products = this.cartService.cartProducts()?.products;
    if (!products) return [];

    const grouped = new Map();
    products.forEach(product => {
      if (grouped.has(product.productId)) {
        grouped.get(product.productId).quantity++;
      } else {
        grouped.set(product.productId, { ...product, quantity: 1 });
      }
    });

    // Ordina per productId per mantenere l'ordine consistente
    return Array.from(grouped.values()).sort((a, b) => a.productId - b.productId);
  });

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.getCart();
    } else {
      this.loadLocalCart();
    }
  }

  getCart() {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cartService.cartProducts.set(data);
      },
      error: (err) => {
        console.error('Errore recupero carrello dal server:', err);
        // Se l'utente non è autenticato e il backend ritorna un errore,
        // ignoriamo l'errore perché useremo il carrello locale
      },
    });
  }

  loadLocalCart() {
    const localCart = this.cartService.getLocalCart();
    if (localCart.length === 0) {
      this.localCartProducts.set([]);
      this.isLoadingLocalCart.set(false);
      return;
    }

    this.isLoadingLocalCart.set(true);

    // Carica i dettagli di tutti i prodotti nel carrello locale
    const productRequests = localCart.map(item =>
      this.productService.getProductById(item.productId)
    );

    forkJoin(productRequests).subscribe({
      next: (products) => {
        const productsWithQuantity = products.map((product, index) => ({
          ...product,
          quantity: localCart[index].quantity
        }));
        this.localCartProducts.set(productsWithQuantity);
        this.isLoadingLocalCart.set(false);
      },
      error: (err) => {
        console.error('Errore caricamento prodotti carrello locale:', err);
        this.localCartProducts.set([]);
        this.isLoadingLocalCart.set(false);
      }
    });
  }

  increaseQuantity(productId: number, currentQuantity: number) {
    if (this.authService.isAuthenticated()) {
      this.cartService.addToCart(productId, currentQuantity + 1).subscribe({
        next: () => {
          this.getCart();
        },
        error: (err) => {
          console.log(err);
          alert('Errore durante l\'aggiornamento della quantità');
        }
      });
    } else {
      // Carrello locale - incrementa la quantità
      this.cartService.updateLocalCartQuantity(productId, currentQuantity + 1);
      this.loadLocalCart();
    }
  }

  decreaseQuantity(productId: number, currentQuantity: number) {
    if (currentQuantity > 1) {
      if (this.authService.isAuthenticated()) {
        this.cartService.addToCart(productId, currentQuantity - 1).subscribe({
          next: () => {
            this.getCart();
          },
          error: (err) => {
            console.log(err);
            alert('Errore durante l\'aggiornamento della quantità');
          }
        });
      } else {
        // Carrello locale - riduci la quantità
        this.cartService.updateLocalCartQuantity(productId, currentQuantity - 1);
        this.loadLocalCart();
      }
    }
  }

  removeProduct(productId: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler rimuovere questo prodotto dal carrello?',
      header: 'Conferma Rimozione',
      acceptLabel: 'Sì, rimuovi',
      rejectLabel: 'Annulla',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        if (this.authService.isAuthenticated()) {
          this.removeItemFromCart(productId);
        } else {
          this.removeItemFromLocalCart(productId);
        }
      },
      reject: () => {
        // Dialog chiuso senza azione
      }
    });
  }

  removeItemFromCart(productId: number) {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        // Delay per evitare il flash del dialog
        setTimeout(() => {
          this.getCart();
        }, 300);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  removeItemFromLocalCart(productId: number) {
    this.cartService.removeFromLocalCart(productId);
    setTimeout(() => {
      this.loadLocalCart();
    }, 300);
  }
}