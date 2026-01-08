import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { SaleService } from '../../../shared/services/sale.service';
import { CardModule } from 'primeng/card';
import { CartService } from '../../../shared/services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { SaleResponse } from '../../../shared/models/saleModel';
import { AddressResponse } from '../../../shared/models/addressModel';

@Component({
  selector: 'app-sale.component',
  imports: [CardModule, CommonModule, FormsModule, InputTextModule, ButtonModule, DividerModule, SelectModule, ToastModule],
  providers: [MessageService],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css',
})


export class SaleComponent implements OnInit {
  private saleService = inject(SaleService);
  cartService = inject(CartService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  totalPrice = computed(() => this.cartService.cartProducts()?.totalAmount ?? 0);
  totalElements = computed(() => this.cartService.cartProducts()?.totalElements ?? 0);

  isProcessing = signal<boolean>(false);

  // Opzioni metodo di spedizione
  shipMethodOptions = [
    { label: 'CARGO TRANSPORT', value: false },
    { label: 'CARGO EXPRESS (+5$)', value: true }
  ];

  // Dati dell'ordine
  shipMethodSignal = signal<boolean>(false);
  
  // Computed per il costo di spedizione
  shippingCost = computed(() => this.shipMethodSignal() ? 5 : 0);
  
  // Computed per il totale finale
  finalTotal = computed(() => this.totalPrice() + this.shippingCost());
  
  // Computed per calcolare l'IVA per ogni prodotto (22%)
  taxAmount = computed(() => {
    const products = this.cartService.cartProducts()?.products ?? [];
    return products.reduce((total, product) => {
      const productTax = product.listPrice * 0.22;
      return total + productTax;
    }, 0);
  });
  
  // Computed per il totale con IVA
  totalWithTax = computed(() => this.finalTotal() + this.taxAmount());
  
  // shipType segue automaticamente shipMethod
  get shipType(): boolean {
    return this.shipMethodSignal();
  }
  
  get shipMethod(): boolean {
    return this.shipMethodSignal();
  }
  
  set shipMethod(value: boolean) {
    this.shipMethodSignal.set(value);
  }
  
  creditCardApprovalCode: string = '';
  comment: string = '';
  discountCode: string = '';

  // Indirizzo di spedizione
  shipToAddress: AddressResponse = {
    addressLine1: '',
    addressLine2: null,
    city: '',
    stateProvince: '',
    countryRegion: '',
    postalCode: ''
  };

  // Indirizzo di fatturazione
  billToAddress: AddressResponse = {
    addressLine1: '',
    addressLine2: null,
    city: '',
    stateProvince: '',
    countryRegion: '',
    postalCode: ''
  };

  useSameAddress: boolean = true;

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: (data) => {
        this.cartService.cartProducts.set(data);
      },
    });
  }

  copyShippingToBilling(): void {
    if (this.useSameAddress) {
      this.billToAddress = { ...this.shipToAddress };
    }
  }

  createOrder(): void {
    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attenzione',
        detail: 'Per favore compila tutti i campi obbligatori',
        life: 5000
      });
      return;
    }

    this.isProcessing.set(true);

    const orderData: SaleResponse = {
      shipMethod: this.shipMethod ? 'CARGO EXPRESS' : 'CARGO TRANSPORT',
      creditCardApprovalCode: this.creditCardApprovalCode,
      comment: this.comment,
      shipType: this.shipType,
      shipToAddress: this.shipToAddress,
      billToAddress: this.useSameAddress ? this.shipToAddress : this.billToAddress,
      discountCode: this.discountCode
    };

    this.saleService.createOrder(orderData).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Ordine creato con successo!',
          life: 3000
        });
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error) => {
        this.isProcessing.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Errore nella creazione dell\'ordine: ' + (error.error?.message || 'Errore sconosciuto'),
          life: 5000
        });
      }
    });
  }

  validateForm(): boolean {
    return !!this.shipToAddress.addressLine1 &&
           !!this.shipToAddress.city &&
           !!this.shipToAddress.stateProvince &&
           !!this.shipToAddress.countryRegion &&
           !!this.shipToAddress.postalCode &&
           !!this.creditCardApprovalCode;
  }
}
