import { Component, inject, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { CartComponent } from '../../features/cart/cart.component';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProfileService } from '../../shared/services/profile.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    RouterLink,
    DrawerModule,
    SidebarComponent,
    CommonModule,
    OverlayBadgeModule,
    BadgeModule,
    CartComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);
  public cartService = inject(CartService);

  isNavbarVisible = true;
  isAtTop = true;
  private lastScrollTop = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop && scrollTop > 120) {
      this.isNavbarVisible = false;
    } else {
      this.isNavbarVisible = true;
    }

    this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }
}
