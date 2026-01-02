import { Component, computed, inject, OnInit } from '@angular/core';
import { CartService } from '../../shared/services/cart.service';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [CardModule, CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cartService = inject(CartService);

  cartProducts = computed(() => this.cartService.cartProducts());

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
}
