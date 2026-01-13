import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

//Service che gestisce le chiamate API relative alla logistica (recupero e modifica ordini)
import { LogisticService } from '../../shared/services/logistic.service';

//Modello dell'ordine (header): dati che arrivano dal backend
import { SalesOrderHeader } from '../../shared/models/salesOrderHeader';

//Modello del payload inviato al Backend per la modifica dell'ordine
import { LogisticManagerRequest } from '../../shared/models/logisticManagerRequest';

//Componenti PrimeNG: Modali, Pulsanti e Notifiche Toast
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
  providers: [ConfirmationService, MessageService], //Provider LOCALI
  templateUrl: './logistic.component.html',
  styleUrl: './logistic.component.css'
})
export class LogisticComponent {

  orders$: Observable<SalesOrderHeader[]>; //Stream degli ordini
  activeOrder?: SalesOrderHeader; //Ordine selezionato per dettaglio/modifica

  //Modalità UI:
  //- closed: nessun dettaglio/modifica aperto
  //- detail: visualizzazione dettaglio
  //- edit: modalità modifica
  rowMode: 'closed' | 'detail' | 'edit' = 'closed'; 

  editForm!: FormGroup; //Reactive form per la modifica dell'ordine

  // Mappatura status da Number a String per sola visualizzazione
  statusMap: Record<number, string> = {
    1: 'In lavorazione',
    2: 'Approvato',
    3: 'In backorder',
    4: 'Rifiutato',
    5: 'Spedito',
    6: 'Cancellato'
  };

  /** Elenco status che permettono la modifica */
  editableStatuses = [1, 2, 3];

  constructor(
    private logisticService: LogisticService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {

    //Recupero tutti gli ordini all'inizializzazione
    this.orders$ = this.logisticService.getOrders();
  }


  /* ======================= UTILITIES ======================= */

  //Ritorna la label dello status 
  getStatusLabel(status: number): string {
    return this.statusMap[status] ?? 'Sconosciuto';
  }

  //Verifica se l'ordine è modificabile 
  canEdit(order: SalesOrderHeader): boolean {
    return this.editableStatuses.includes(order.status);
  }

  //Converte una data ISO(stringa) in formato YYYY-MM-DD compatibile per <input type=date>
  private toDateInput(value: string | null | undefined): string | null {
    if (!value) return null;
    return value.substring(0, 10); // YYYY-MM-DD
  }


  /* ======================= DETTAGLIO ======================= */

  //Apre il dettaglio dell'ordine selezionato
  openDetail(order: SalesOrderHeader): void {
    this.activeOrder = order;
    this.rowMode = 'detail';
  }

  //Chiude il dettaglio/modifica
  closeDetail(): void {
    this.activeOrder = undefined;
    this.rowMode = 'closed';
  }


  /* ======================= MODIFICA ======================= */

  //Apre la modalità modifica, popola il form con i dati dell'ordine selezionato
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

  //Salva le modifiche effettuate
  saveEdit(): void {
    if (!this.activeOrder || this.editForm.invalid) return;

    const raw = this.editForm.value;


    //Payload inviato al Backend, se un campo non è stato modificato, viene mantutenuto il valore originale
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

          //Feedback utente SUCCESSO
          this.messageService.add({
            key: 'center',
            severity: 'success',
            summary: 'Salvataggio riuscito',
            detail: 'Ordine aggiornato correttamente',
            life: 3000
          });

          //Ricarica gli ordini e chiude il dettaglio/modifica
          this.orders$ = this.logisticService.getOrders();
          this.closeDetail();
        },
        error: () => {

          //Feedback utente ERRORE
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

  //Annulla le modifiche effettuate:
  //- Se il form non è dirty(nessuna modifica), torna al dettaglio
  //- Se il form è dirty(modificato), chiede conferma all'utente
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

/* ======================= ELIMINAZIONE (STATUS 6) ======================= */

  //Chiede conferma per cancellare l'ordine (impostare status a 6)
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

  //Imposta lo status dell'ordine a 6 (Cancellato)
  private cancelOrder(): void {
    if (!this.activeOrder) return;

    const payload: LogisticManagerRequest = {
      shipDate: this.toDateInput(this.activeOrder.shipDate)!,
      dueDate: this.toDateInput(this.activeOrder.dueDate)!,
      status: 6 
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
            life: 3000 // Durata della notifica
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
            life: 3000 // Durata della notifica
          });
        }
      });
  }

}
