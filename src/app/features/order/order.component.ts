import { Component, inject, OnInit, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { OrderService } from '../../shared/services/order.service';
import { OrderModelResponse } from '../../shared/models/orderModel';
import { CommonModule } from '@angular/common';
import { OrderListModule } from 'primeng/orderlist';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-order',
  imports: [CardModule, DialogModule, CommonModule, TableModule, OrderListModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  orders = signal<OrderModelResponse[]>([]);

  displayDialog = false;
  selectedOrder: OrderModelResponse | null = null;

  showOrderDetails(order: OrderModelResponse): void {
    this.selectedOrder = order;
    this.displayDialog = true;
  }

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
    });
  }
}
