import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../shared/services/review.service';
import { ReviewRequest, ReviewResponse } from '../../../shared/models/reviewModel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-personal-reviews',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    DialogModule,
    RatingModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './personal-reviews.html',
  styleUrl: './personal-reviews.css',
})

export class PersonalReviews implements OnInit {
  private reviewService = inject(ReviewService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  
  reviews = signal<ReviewResponse[]>([]);
  displayDialog = false;
  editingReview: ReviewResponse | null = null;
  
  newReview: Partial<ReviewRequest> = {
    rating: 0,
    reviewText: ''
  };

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.getReviewsByCustomerId().subscribe(reviews => {
      this.reviews.set(reviews);
    });
  }

  editReview(review: ReviewResponse) {
    this.editingReview = review;
    this.newReview = {
      rating: review.rating + 1, // Converte da 0-4 a 1-5 per il frontend
      reviewText: review.reviewText
    };
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
    this.editingReview = null;
    this.resetForm();
  }

  resetForm() {
    this.newReview = {
      rating: 1, // Inizializzo a 1 perché uso scala 1-5 nel frontend
      reviewText: ''
    };
  }

  isFormValid(): boolean {
    return this.newReview.rating! >= 1 && this.newReview.reviewText!.trim().length > 0;
  }

  submitEdit() {
    if (!this.isFormValid() || !this.editingReview) return;

    const reviewUpdate: Partial<ReviewRequest> = {
      rating: this.newReview.rating! - 1, // Converte da 1-5 a 0-4 per il backend
      reviewText: this.newReview.reviewText!.trim()
    };

    this.reviewService.editReview(this.editingReview._id.toString(), reviewUpdate).subscribe({
      next: (success) => {
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Recensione aggiornata!',
            detail: 'La tua recensione è stata modificata con successo.',
            life: 3000
          });
          this.hideDialog();
          this.loadReviews();
        }
      },
      error: (err) => {
        console.error('Errore durante l\'aggiornamento della recensione:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Errore',
          detail: 'Impossibile aggiornare la recensione. Riprova più tardi.',
          life: 3000
        });
      }
    });
  }

  deleteReview(reviewId: number) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare questa recensione?',
      header: 'Conferma eliminazione',
      acceptLabel: 'Sì',
      rejectLabel: 'No',
      accept: () => {
        this.reviewService.removeReview(reviewId.toString()).subscribe({
          next: (success) => {
            if (success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Recensione eliminata',
                detail: 'La tua recensione è stata eliminata con successo.',
                life: 3000
              });
              this.loadReviews();
            }
          },
          error: (err) => {
            console.error('Errore durante l\'eliminazione della recensione:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Errore',
              detail: 'Impossibile eliminare la recensione. Riprova più tardi.',
              life: 3000
            });
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
