import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewRequest, ReviewResponse } from '../models/reviewModel';

@Injectable({
    providedIn: 'root',
})
export class ReviewService {
    private http = inject(HttpClient);

    private url = environment.apiUrl;

    getReviewsByProductId(productId: number): Observable<ReviewResponse[]> {
        return this.http.get<ReviewResponse[]>(`${this.url}/Review/${productId}`);
    }

    getReviewsByCustomerId(): Observable<ReviewResponse[]> {
        return this.http.get<ReviewResponse[]>(`${this.url}/Review/customer`);
    }

    addNewReview(review: ReviewRequest): Observable<boolean> {
        return this.http.post<boolean>(`${this.url}/Review`, review);
    }

    editReview(id: string, reviewUpdate: Partial<ReviewRequest>): Observable<boolean> {
        return this.http.put<boolean>(`${this.url}/Review/${id}`, reviewUpdate);
    }

    removeReview(id: string): Observable<boolean> {
        return this.http.delete<boolean>(`${this.url}/Review/${id}`);
    }
}