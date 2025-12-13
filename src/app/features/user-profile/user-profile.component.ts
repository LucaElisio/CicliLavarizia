import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileService } from '../../shared/services/profile.service';
import { CustomerInfoRequest } from '../../shared/models/customerModel';
import { AuthService } from '../../shared/services/auth.service';

import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-user-profile',
  imports: [CardModule, IftaLabelModule, InputTextModule, PasswordModule, AvatarModule, ButtonModule, InputGroupModule, InputGroupAddonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  private profileService = inject(ProfileService);

  authService = inject(AuthService);

  customerInfo = signal<CustomerInfoRequest | null>(null);
  labelName!: string;

  ngOnInit(): void {
    this.profileService.getCustomerInfo().subscribe({
      next: (data) => {
        this.customerInfo.set(data);
        const firstInitial = data.firstName?.charAt(0).toUpperCase() ?? '';
        const lastInitial = data.lastName?.charAt(0).toUpperCase() ?? '';
        this.labelName = `${firstInitial}${lastInitial}`;
      },
    })
  }

}
