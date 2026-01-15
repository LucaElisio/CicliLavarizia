import { Component, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { OrderService } from '../../shared/services/order.service';
import { OrderModelResponse } from '../../shared/models/orderModel';
import { CommonModule } from '@angular/common';
import { OrderListModule } from 'primeng/orderlist';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AddressResponse } from '../../shared/models/addressModel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-order',
  imports: [
    CardModule,
    DialogModule,
    CommonModule,
    TableModule,
    OrderListModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  orders = signal<OrderModelResponse[]>([]);

  displayDialog = false;
  displayEditDialog = false;
  selectedOrder: OrderModelResponse | null = null;

  // Dati per la modifica
  editOrderData: {
    comment: string;
    shipMethod: string;
    shipToAddress: AddressResponse;
    billToAddress: AddressResponse;
  } = {
    comment: '',
    shipMethod: '',
    shipToAddress: {
      addressLine1: '',
      addressLine2: null,
      city: '',
      stateProvince: '',
      countryRegion: '',
      postalCode: '',
    },
    billToAddress: {
      addressLine1: '',
      addressLine2: null,
      city: '',
      stateProvince: '',
      countryRegion: '',
      postalCode: '',
    },
  };

  shipMethodOptions = [
    { label: 'CARGO TRANSPORT', value: 'CARGO TRANSPORT' },
    { label: 'CARGO EXPRESS (+5$)', value: 'CARGO EXPRESS' },
  ];

  showOrderDetails(order: OrderModelResponse): void {
    this.selectedOrder = order;
    this.displayDialog = true;
  }

  openEditDialog(order: OrderModelResponse, event: Event): void {
    event.stopPropagation();
    this.selectedOrder = order;

    // Popola i dati di modifica con i valori attuali
    this.editOrderData = {
      comment: order.comment || '',
      shipMethod: order.shipMethod,
      shipToAddress: { ...order.shipToAddress } as AddressResponse,
      billToAddress: { ...order.billToAddress } as AddressResponse,
    };

    this.displayEditDialog = true;
  }

  statusLabel(status: number): string {
    let label: string = '';

    switch (status) {
      case 1:
        label = 'Process';
        break;
      case 2:
        label = 'Approved';
        break;
      case 3:
        label = 'Backordered';
        break;
      case 4:
        label = 'Rejected';
        break;
      case 5:
        label = 'Shipped';
        break;
      case 6:
        label = 'cancelled';
        break;
    }
    return label;
  }

  updateOrder(): void {
    if (!this.selectedOrder) return;

    this.orderService.updateOrder(this.selectedOrder.salesOrderId, this.editOrderData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Ordine aggiornato',
          detail: "I dettagli dell'ordine sono stati aggiornati con successo",
          life: 3000,
        });
        this.displayEditDialog = false;
        this.getOrders();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: "Impossibile aggiornare l'ordine",
          life: 5000,
        });
      },
    });
  }

  removeOrder(orderId: number, event: Event): void {
    event.stopPropagation();

    this.confirmationService.confirm({
      message: 'Sei sicuro di voler rimuovere questo ordine?',
      header: 'Conferma Rimozione',
      acceptLabel: 'Sì',
      rejectLabel: 'No',
      accept: () => {
        this.orderService.removeOrder(orderId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Ordine rimosso',
              detail: "L'ordine è stato rimosso con successo",
              life: 3000,
            });
            this.getOrders();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: "Impossibile rimuovere l'ordine",
              life: 5000,
            });
          },
        });
      },
    });
  }

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // Filtra gli ordini con status 6 (cancellati)
        const activeOrders = data.filter((order) => order.status !== 6);
        this.orders.set(activeOrders);
      },
    });
  }
}
