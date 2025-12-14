import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { IftaLabelModule } from 'primeng/iftalabel';
import { ProfileService } from '../../../shared/services/profile.service';
import { AuthService } from '../../../shared/services/auth.service';
import { CustomerInfoRequest } from '../../../shared/models/customerModel';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-sidebar',
  imports: [
    DrawerModule,
    CardModule,
    IftaLabelModule,
    InputTextModule,
    PasswordModule,
    AvatarModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    RouterLink,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private profileService = inject(ProfileService);

  authService = inject(AuthService);
  visible: boolean = false;

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
    });
  }
}
