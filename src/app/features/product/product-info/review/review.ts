import { Component, inject, Input, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../../shared/services/review.service';
import { ReviewRequest, ReviewResponse } from '../../../../shared/models/reviewModel';
import { AuthService } from '../../../../shared/services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-review',
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, RatingModule, ToastModule, TooltipModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './review.html',
  styleUrl: './review.css',
})

export class Review {
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  @Input() productId!: number;

  reviews = signal<ReviewResponse[]>([]);
  displayDialog = false;
  isEditMode = false;
  editingReviewId: number | null = null;
  
  newReview: Partial<ReviewRequest> = {
    rating: 0,
    reviewText: ''
  };

  averageRating = computed(() => {
    const reviewsList = this.reviews();
    if (reviewsList.length === 0) return 0;
    const sum = reviewsList.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviewsList.length).toFixed(1);
  });

  hasUserReview = computed(() => {
    const currentCustomerId = this.authService.customerInfo()?.customerId;
    if (!currentCustomerId) return false;
    return this.reviews().some(review => review.customerId === currentCustomerId);
  });

  ngOnInit() {
    // Inizializzazione del componente
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.getReviewsByProductId(this.productId).subscribe(reviews => {
      this.reviews.set(reviews);
      console.log('Recensioni del prodotto:', reviews);
    });
  }

  showDialog() {
    this.isEditMode = false;
    this.editingReviewId = null;
    this.displayDialog = true;
    this.resetForm();
  }

  hideDialog() {
    this.displayDialog = false;
    this.isEditMode = false;
    this.editingReviewId = null;
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

  isUserReview(customerId: number): boolean {
    const currentCustomerId = this.authService.customerInfo()?.customerId;
    return currentCustomerId === customerId;
  }

  editReview(review: ReviewResponse) {
    this.isEditMode = true;
    this.editingReviewId = review._id;
    this.newReview = {
      rating: review.rating + 1, // Converte da 0-4 a 1-5 per il frontend
      reviewText: review.reviewText
    };
    this.displayDialog = true;
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

  submitReview() {
    if (!this.isFormValid()) return;

    if (this.isEditMode && this.editingReviewId) {
      // Modifica recensione esistente
      const reviewUpdate: Partial<ReviewRequest> = {
        rating: this.newReview.rating! - 1, // Converte da 1-5 a 0-4 per il backend
        reviewText: this.newReview.reviewText!.trim()
      };

      this.reviewService.editReview(this.editingReviewId.toString(), reviewUpdate).subscribe({
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
    } else {
      // Nuova recensione
      const reviewRequest: ReviewRequest = {
        productId: this.productId,
        customerId: 0, // Verrà gestito dal backend con l'autenticazione
        rating: this.newReview.rating! - 1, // Converte da 1-5 a 0-4 per il backend
        reviewText: this.newReview.reviewText!.trim()
      };

      this.reviewService.addNewReview(reviewRequest).subscribe({
        next: (success) => {
          if (success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Recensione pubblicata!',
              detail: 'Grazie per aver condiviso la tua opinione.',
              life: 3000
            });
            this.hideDialog();
            this.loadReviews();
          }
        },
        error: (err) => {
          console.error('Errore durante la pubblicazione della recensione:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Errore',
            detail: 'Impossibile pubblicare la recensione. Riprova più tardi.',
            life: 3000
          });
        }
      });
    }
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
