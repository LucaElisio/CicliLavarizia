import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

import { LogisticService } from '../../shared/services/logistic.service';
import { SalesOrderHeader } from '../../shared/models/salesOrderHeader';
import { LogisticManagerRequest } from '../../shared/models/logisticManagerRequest';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';


@Component({
  selector: 'app-logistic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ButtonModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './logistic.component.html',
  styleUrl: './logistic.component.css'
})
export class LogisticComponent {

  orders$: Observable<SalesOrderHeader[]>;

  activeOrder?: SalesOrderHeader;
  rowMode: 'closed' | 'detail' | 'edit' = 'closed';

  editForm!: FormGroup;

  /** Mappa status → label (ITALIANO) */
  statusMap: Record<number, string> = {
    1: 'In lavorazione',
    2: 'Approvato',
    3: 'In backorder',
    4: 'Rifiutato',
    5: 'Spedito',
    6: 'Cancellato'
  };

  /** Status modificabili */
  editableStatuses = [1, 2, 3];

  constructor(
    private logisticService: LogisticService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.orders$ = this.logisticService.getOrders();
  }

  /* =======================
     UTILITIES
     ======================= */

  /** Ritorna la label dello status */
  getStatusLabel(status: number): string {
    return this.statusMap[status] ?? 'Sconosciuto';
  }

  /** Verifica se l'ordine è modificabile */
  canEdit(order: SalesOrderHeader): boolean {
    return this.editableStatuses.includes(order.status);
  }

  private toDateInput(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.substring(0, 10); // YYYY-MM-DD
  }

  /* =======================
     DETTAGLIO
     ======================= */

  openDetail(order: SalesOrderHeader): void {
    this.activeOrder = order;
    this.rowMode = 'detail';
  }

  closeDetail(): void {
    this.activeOrder = undefined;
    this.rowMode = 'closed';
  }

  /* =======================
     MODIFICA
     ======================= */

  openEdit(): void {
    if (!this.activeOrder || !this.canEdit(this.activeOrder)) return;

    // Form già popolato 
    this.editForm = this.fb.group({
      shipDate: [this.toDateInput(this.activeOrder.shipDate)],
      dueDate: [this.toDateInput(this.activeOrder.dueDate)],
      status: [this.activeOrder.status]
    });

    this.rowMode = 'edit';
  }

  saveEdit(): void {
    if (!this.activeOrder || this.editForm.invalid) return;

    const raw = this.editForm.value;

    const payload: LogisticManagerRequest = {
      shipDate: raw.shipDate
        ? raw.shipDate
        : this.toDateInput(this.activeOrder.shipDate)!,

      dueDate: raw.dueDate
        ? raw.dueDate
        : this.toDateInput(this.activeOrder.dueDate)!,

      status: Number(raw.status)
    };

    this.logisticService
      .updateOrder(this.activeOrder.salesOrderId, payload)
      .subscribe({
        next: () => {
          this.messageService.add({
            key: 'center',
            severity: 'success',
            summary: 'Salvataggio riuscito',
            detail: 'Ordine aggiornato correttamente',
            life: 3000
          });

          this.orders$ = this.logisticService.getOrders();
          this.closeDetail();
        },
        error: () => {
          this.messageService.add({
            key: 'center',
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore durante il salvataggio',
            life: 4000
          });
        }
      });
  }


  cancelEdit(): void {
    if (!this.editForm.dirty) {
      this.rowMode = 'detail';
      return;
    }

    this.confirmationService.confirm({
      header: 'Modifiche non salvate',
      message: 'Vuoi annullare le modifiche?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sì',
      rejectLabel: 'No',
      accept: () => this.rowMode = 'detail'
    });
  }

  /* =======================
     ELIMINAZIONE (STATUS 6)
     ======================= */

  askDelete(): void {
    if (!this.activeOrder) return;

    this.confirmationService.confirm({
      header: 'Conferma cancellazione',
      message: 'L’ordine verrà impostato come "Cancellato". Continuare?',
      icon: 'pi pi-trash',
      acceptLabel: 'Conferma',
      rejectLabel: 'Annulla',
      accept: () => this.cancelOrder()
    });
  }

  private cancelOrder(): void {
    if (!this.activeOrder) return;

    const payload: LogisticManagerRequest = {
      shipDate: this.toDateInput(this.activeOrder.shipDate)!,
      dueDate: this.toDateInput(this.activeOrder.dueDate)!,
      status: 6 // Cancellato
    };

    this.logisticService
      .updateOrder(this.activeOrder.salesOrderId, payload)
      .subscribe({
        next: () => {
          this.messageService.add({
            key: 'center',
            severity: 'success',
            summary: 'Ordine cancellato',
            detail: 'Lo stato è stato impostato su "Cancellato"',
            life: 3000
          });

          this.orders$ = this.logisticService.getOrders();
          this.closeDetail();
        },
        error: () => {
          this.messageService.add({
            key: 'center',
            severity: 'error',
            summary: 'Errore',
            detail: 'Errore durante la cancellazione',
            life: 4000
          });
        }
      });
  }

}
