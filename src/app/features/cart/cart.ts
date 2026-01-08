import { Component, computed, inject, OnInit } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Button } from "primeng/button";
import { RouterLink } from "@angular/router";
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-cart',
  imports: [CardModule, CommonModule, Button, RouterLink, DividerModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);

  cartProducts = computed(() => this.cartService.cartProducts());
  totalElements = computed(() => this.cartService.cartProducts()?.totalElements ?? 0);
  totalPrice = computed(() => this.cartService.cartProducts()?.totalAmount ?? 0);

  // Raggruppa prodotti duplicati con quantità
  groupedProducts = computed(() => {
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
    this.getCart();
  }

  getCart() {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cartService.cartProducts.set(data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  increaseQuantity(productId: number, currentQuantity: number) {
    this.cartService.addToCart(productId, currentQuantity + 1).subscribe({
      next: () => {
        this.getCart();
      },
      error: (err) => {
        console.log(err);
        alert('Errore durante l\'aggiornamento della quantità');
      }
    });
  }

  decreaseQuantity(productId: number, currentQuantity: number) {
    if (currentQuantity > 1) {
      this.cartService.addToCart(productId, currentQuantity - 1).subscribe({
        next: () => {
          this.getCart();
        },
        error: (err) => {
          console.log(err);
          alert('Errore durante l\'aggiornamento della quantità');
        }
      });
    }
  }

  removeProduct(productId: number) {
    if (confirm('Sei sicuro di voler rimuovere questo prodotto dal carrello?')) {
      this.removeItemFromCart(productId);
    }
  }

  removeItemFromCart(productId: number) {
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.getCart();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}