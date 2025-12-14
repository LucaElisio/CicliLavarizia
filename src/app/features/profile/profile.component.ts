import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { CustomerInfoRequest } from '../../shared/models/customerModel';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-profile',
  imports: [CardModule, RouterLink, ButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);

  customerInfo = signal<CustomerInfoRequest | null>(null);

  ngOnInit(): void {
    this.profileService.getCustomerInfo().subscribe({
      next: (data) => {
        this.customerInfo.set(data);
        console.log(data);
      },
    });
  }
}
