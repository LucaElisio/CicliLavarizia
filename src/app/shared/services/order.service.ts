import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderModelResponse } from '../models/orderModel';
import { SaleResponse } from '../models/saleModel';
import { __param } from 'tslib';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private url = environment.apiUrl;
  private http = inject(HttpClient);

  getOrders(): Observable<OrderModelResponse[]> {
    return this.http.get<OrderModelResponse[]>(`${this.url}/Sales/GetCustomerOrders`);
  }

  updateOrder(orderId: number, orderData: any): Observable<any> {
    return this.http.put(`${this.url}/Sales/UpdateSalesOrder/${orderId}`, orderData);
  }

  removeOrder(orderId: number): Observable<OrderModelResponse> {
    return this.http.delete<OrderModelResponse>(`${this.url}/Sales/DeleteSalesOrder/Delete%20Order${orderId}`);
  }
}
