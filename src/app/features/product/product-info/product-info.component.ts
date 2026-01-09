import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProductService } from '../../../shared/services/product.service';
import { ProductResponse } from '../../../shared/models/productModel';
import { CardModule } from 'primeng/card';
import { CartService } from '../../../shared/services/cart.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product-info',
  imports: [CardModule, ButtonModule, CommonModule, DividerModule, ToastModule],
  providers: [MessageService],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css',
})
export class ProductInfoComponent implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private messageService = inject(MessageService);
  location = inject(Location);

  productId!: number;
  product = signal<ProductResponse | null>(null);

  productDescription: string = '';

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe({
      next: (data) => {
        this.productId = Number(data['productId']);
      },
    });
    this.getProduct();
  }

  getProduct() {
    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product.set(data);
        // Carica la descrizione del modello dopo aver caricato il prodotto
        this.getModel();
      },
    });
  }

  addToCart(productId: number, quantity: number = 1) {
    console.log(`Aggiungo al carrello il prodotto con ID: ${productId}, Quantità: ${quantity}`);
    this.cartService.addToCart(productId, quantity).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Elemento aggiunto al carrello!',
          life: 3000
        });
        this.cartService.getCart().subscribe({
          next: (data) => {
            this.cartService.cartProducts.set(data);
          },
        });
      },
    });
  }

  getModel(): void {
    const modelsLoadSize = 100;
    this.productService.getProductModels(1, modelsLoadSize, "All").subscribe({
      next: (data) => {
        data.forEach(model => {
          if (model.productModelId === this.product()?.productModelId) {
            console.log('Descrizione modello trovata:', model.modelDescription);
            this.productDescription = model.modelDescription;
          }
        });
      },
      error: (err) => {
        console.error('Errore nella chiamata API per le descrizioni:', err);
      }
    });

  }

}