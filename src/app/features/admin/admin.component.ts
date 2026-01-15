import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../shared/services/admin.service';
import {
  CustomerAdminUpdateRequest,
  CustomerInfoRequest,
  Role,
} from '../../shared/models/customerModel';
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
    SelectButtonModule,
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
    4: 'Guest',
  };

  // Mappatura inversa: stringa -> numero
  private roleReverseMap: { [key: string]: number } = {
    Admin: 0,
    Customer: 1,
    SaleAssistant: 2,
    Logistic: 3,
    Guest: 4,
  };

  // Stato vista
  currentView: 'customers' | 'employees' = 'customers';

  viewOptions: ViewOption[] = [
    { label: 'Clienti', value: 'customers' },
    { label: 'Dipendenti', value: 'employees' },
  ];

  employees = signal<CustomerAdminUpdateRequest[]>([]);
  customers = signal<CustomerInfoRequest[]>([]);
  loading = false;

  roles = [
    { label: 'Admin', value: 0 },
    { label: 'Customer', value: 1 },
    { label: 'SaleAssistant', value: 2 },
    { label: 'Logistic', value: 3 },
  ];

  ngOnInit(): void {
    // Carica automaticamente i clienti all'avvio
    // Usa setTimeout per evitare ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loadCustomers();
    });
  }

  onViewChange(): void {
    // Usa setTimeout per evitare l'errore ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      if (this.currentView === 'customers') {
        if (this.customers().length === 0) {
          this.loadCustomers();
        }
      } else if (this.currentView === 'employees') {
        if (this.employees().length === 0) {
          this.loadEmployees();
        }
      }
    });
  }

  loadCustomers(): void {
    this.loading = true;
    this.adminService.getCustomers().subscribe({
      next: (data) => {
        // Filtra solo i clienti con ruolo Customer
        // Il backend restituisce numeri (1), l'enum è stringhe ('Customer')
        const filteredCustomers = data.filter((c) => (c.role as any) === 1);
        this.customers.set(filteredCustomers);
        this.loading = false;
      },
      error: (err) => {
        this.customers.set([]);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile caricare i clienti',
        });
      },
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.adminService.getEmployees().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.employees.set(data);
        } else {
          this.employees.set([]);
        }
        this.loading = false;
      },
      error: (err) => {
        this.employees.set([]);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile caricare i dipendenti',
        });
      },
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
          detail: 'Ruolo aggiornato con successo',
        });
        // Ricarica entrambe le liste dopo l'aggiornamento
        setTimeout(() => {
          this.loadEmployees();
          this.loadCustomers();
        });
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile aggiornare il ruolo',
        });
      },
    });
  }

  updateCustomerRole(customer: CustomerInfoRequest): void {
    this.loading = true;
    const updateRequest: CustomerAdminUpdateRequest = {
      customerId: customer.customerId,
      role: customer.role,
    };

    this.adminService.updateUserRole(updateRequest).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successo',
          detail: 'Ruolo cliente aggiornato con successo',
        });
        // Ricarica entrambe le liste dopo l'aggiornamento
        setTimeout(() => {
          this.loadCustomers();
          this.loadEmployees();
        });
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile aggiornare il ruolo del cliente',
        });
      },
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
