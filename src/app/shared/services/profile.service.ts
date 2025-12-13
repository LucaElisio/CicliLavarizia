import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerInfoRequest } from '../models/customerModel';


@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);

  private url = environment.apiUrl;

  getCustomerInfo(): Observable<CustomerInfoRequest> {
    return this.http.get<CustomerInfoRequest>(`${this.url}/Customer/GetCustomerInfo`);
  }
}
