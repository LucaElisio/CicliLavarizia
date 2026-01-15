import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map, Observable, of, catchError, firstValueFrom, concatMap, from } from 'rxjs';
import { CustomerAdminUpdateRequest, CustomerInfoRequest } from '../models/customerModel';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private url = environment.apiUrl;

  getEmployees(): Observable<CustomerAdminUpdateRequest[]> {
    return this.http.get<CustomerAdminUpdateRequest[]>(`${this.url}/Customer/GetEmployees`);
  }

  updateUserRole(request: CustomerAdminUpdateRequest): Observable<CustomerAdminUpdateRequest> {
    return this.http.put<CustomerAdminUpdateRequest>(
      `${this.url}/Auth/UpdateCustomerRole`,
      request
    );
  }

  getCustomers(): Observable<CustomerInfoRequest[]> {
    return this.http.get<CustomerInfoRequest[]>(`${this.url}/Customer/GetCustomers`);
  }
}
