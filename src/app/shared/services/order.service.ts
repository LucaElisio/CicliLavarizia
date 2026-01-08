import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderModelResponse } from '../models/orderModel';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private url = environment.apiUrl;
  private http = inject(HttpClient);

  getOrders(): Observable<OrderModelResponse[]> {
    return this.http.get<OrderModelResponse[]>(`${this.url}/Sales/GetCustomerOrders`);
  }
}
