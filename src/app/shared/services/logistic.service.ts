import { Injectable } from "@angular/core";

import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { SalesOrderHeader } from "../models/salesOrderHeader";
import { LogisticManagerRequest } from "../models/logisticManagerRequest";


@Injectable({
    providedIn: 'root'
})
export class LogisticService {

    private url = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // GET: tutti gli ordini
    getOrders(): Observable<SalesOrderHeader[]> {
        return this.http.get<SalesOrderHeader[]>(`${this.url}/logistic`);
    }

    // GET: ordine per ID
    getOrderById(id: number): Observable<SalesOrderHeader> {
        return this.http.get<SalesOrderHeader>(`${this.url}/logistic/${id}`);
    }

    //INSERT??

    // PUT: Modifica dati ordine
    updateOrder(
        id: number,
        data: LogisticManagerRequest
    ): Observable<void> {
        return this.http.put<void>(`${this.url}/logistic/${id}`, data);
    }
}


