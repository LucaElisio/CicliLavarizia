import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete',
  imports: [],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.css',
})
export class DeleteComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.authService.delete().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.authService.changeAuthState();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
