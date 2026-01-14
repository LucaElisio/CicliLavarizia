import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';
import { CustomerAdminUpdateRequest, CustomerInfoRequest, Role } from '../../shared/models/customerModel';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';

interface ViewOption {
  label: string;
  value: 'customers' | 'employees';
}

@Component({
  selector: 'app-admin.component',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    CardModule,
    TagModule,
    SelectButtonModule
  ],
  providers: [MessageService],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private messageService = inject(MessageService);

  // Mappatura ruoli: numero -> stringa
  private roleMap: { [key: number]: string } = {
    0: 'Admin',
    1: 'Customer',
    2: 'SaleAssistant',
    3: 'Logistic',
    4: 'Guest'
  };

  // Mappatura inversa: stringa -> numero
  private roleReverseMap: { [key: string]: number } = {
    'Admin': 0,
    'Customer': 1,
    'SaleAssistant': 2,
    'Logistic': 3,
    'Guest': 4
  };

  // Stato vista
  currentView: 'customers' | 'employees' = 'customers';
  viewOptions: ViewOption[] = [
    { label: 'Clienti', value: 'customers' },
    { label: 'Dipendenti', value: 'employees' }
  ];

  // Dati
  employees: CustomerAdminUpdateRequest[] = [];
  customers: CustomerInfoRequest[] = [];
  loading = false;

  // Opzioni ruoli per il dropdown (escluso Guest)
  roles = [
    { label: 'Admin', value: 0 },
    { label: 'Customer', value: 1 },
    { label: 'SaleAssistant', value: 2 },
    { label: 'Logistic', value: 3 }
  ];

  ngOnInit(): void {
    console.log('AdminComponent inizializzato');
    console.log('Vista corrente:', this.currentView);
    this.loadCustomers();
  }

  onViewChange(): void {
    console.log('Vista cambiata a:', this.currentView);
    if (this.currentView === 'customers') {
      if (this.customers.length === 0) {
        this.loadCustomers();
      }
    } else if (this.currentView === 'employees') {
      if (this.employees.length === 0) {
        this.loadEmployees();
      }
    }
  }

  loadCustomers(): void {
    console.log('loadCustomers chiamato');
    this.loading = true;
    this.adminService.getCustomers().subscribe({
      next: (data) => {
        console.log('Dati ricevuti dal server:', data);
        
        // Gestisci diversi formati di risposta
        let customerArray: CustomerInfoRequest[] = [];
        
        if (Array.isArray(data)) {
          customerArray = data;
        } else if (data && typeof data === 'object') {
          // Prova a cercare l'array dentro l'oggetto
          const possibleKeys = ['customers', 'data', 'items', 'results', 'value'];
          for (const key of possibleKeys) {
            if (Array.isArray((data as any)[key])) {
              customerArray = (data as any)[key];
              console.log(`Array trovato in data.${key}`);
              break;
            }
          }
          
          // Se non è stato trovato in nessuna chiave, prova a usare l'oggetto stesso come singolo elemento
          if (customerArray.length === 0 && Object.keys(data).length > 0) {
            customerArray = [data as any];
            console.log('Oggetto singolo convertito in array');
          }
        }
        
        this.customers = customerArray;
        console.log('Numero clienti:', this.customers.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('ERRORE nel caricamento clienti:', err);
        this.customers = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile caricare i clienti'
        });
      }
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        console.log('Dipendenti caricati:', data);
        
        // Assicurati che sia un array
        if (Array.isArray(data)) {
          this.employees = data;
        } else {
          this.employees = [];
          console.warn('I dati ricevuti non sono un array!');
        }
        
        this.loading = false;
      },
      error: (err) => {
        this.employees = [];
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile caricare i dipendenti'
        });
        console.error('Errore caricamento dipendenti:', err);
      }
    });
  }

  updateRole(employee: CustomerAdminUpdateRequest): void {
    this.loading = true;
    this.adminService.updateUserRole(employee).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Ruolo aggiornato con successo'
        });
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile aggiornare il ruolo'
        });
        console.error('Errore aggiornamento ruolo:', err);
      }
    });
  }

  getRoleLabel(role: any): string {
    if (role === null || role === undefined) {
      return 'N/A';
    }
    
    // Se è un numero, usa la mappa
    if (typeof role === 'number') {
      return this.roleMap[role] || 'Unknown';
    }
    
    // Se è già una stringa, ritornala
    if (typeof role === 'string') {
      return role;
    }
    
    return String(role);
  }

  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (role) {
      case 'Admin':
        return 'danger';
      case 'SaleAssistant':
        return 'info';
      case 'Logistic':
        return 'warn';
      case 'Customer':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
