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
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';



@Component({
  selector: 'app-logistic',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    DatePickerModule
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
  editableStatuses = [1, 2, 3, 5];

  statusOptions = this.editableStatuses.map(s => ({
    label: this.statusMap[s],
    value: s
  }));

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

  /** Converte stringa ISO in Date */
  private toDate(value?: string | null): Date | null {
    if (!value) return null;
    return new Date(value);
  }

  /** Converte Date in YYYY-MM-DD gestendo anche la timezone */
  private toIsoDate(value?: Date | null): string | null {
    if (!value) return null;

    const year = value.getFullYear(); // Ottengo l'anno usano la data locale
    const month = String(value.getMonth() + 1).padStart(2, '0'); //Ottengo mese, aggiustando per l'indice 0-based (gennaio sarebbe 0, così diventa 1), con padding 1 diventa 01
    const day = String(value.getDate()).padStart(2, '0'); // Ottengo giorno del mese locale, con padding

    return `${year}-${month}-${day}`; // Ritorno in formato YYYY-MM-DD
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

    this.editForm = this.fb.group({
      shipDate: [this.toDate(this.activeOrder.shipDate)],
      dueDate: [this.toDate(this.activeOrder.dueDate)],
      status: [this.activeOrder.status]
    });

    this.rowMode = 'edit';
  }


  //Salva le modifiche effettuate
  saveEdit(): void {
    if (!this.activeOrder || this.editForm.invalid) return;

    const raw = this.editForm.value;

    const payload: LogisticManagerRequest = {
      shipDate: this.toIsoDate(raw.shipDate)!,
      dueDate: this.toIsoDate(raw.dueDate)!,
      status: Number(raw.status)
    };

    console.log('FORM RAW', raw);
    console.log('PAYLOAD', payload);


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
      shipDate: this.toIsoDate(this.toDate(this.activeOrder.shipDate))!,
      dueDate: this.toIsoDate(this.toDate(this.activeOrder.dueDate))!,
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
