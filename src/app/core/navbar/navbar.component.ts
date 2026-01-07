import { Component, inject, HostListener} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProfileService } from '../../shared/services/profile.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { CartService } from '../../shared/services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink, DrawerModule, SidebarComponent, CommonModule, OverlayBadgeModule],
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
  private scrollThreshold = 50;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Determina se siamo in cima alla pagina
    this.isAtTop = scrollTop <= this.scrollThreshold;
    
    if (this.isAtTop) {
      // In cima: navbar sempre visibile
      this.isNavbarVisible = true;
    } 
    // Nasconde navbar quando si scrolla verso il basso
    else if (scrollTop > this.lastScrollTop) {
      this.isNavbarVisible = false;
    } 
    // Mostra navbar quando si scrolla verso l'alto
    else {
      this.isNavbarVisible = true;
    }
    
    this.lastScrollTop = scrollTop;
  }
}
