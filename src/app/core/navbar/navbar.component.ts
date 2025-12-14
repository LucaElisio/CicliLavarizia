import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProfileService } from '../../shared/services/profile.service';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink, DrawerModule, SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);
}
