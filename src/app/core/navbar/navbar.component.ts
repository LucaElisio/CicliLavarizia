import { Component, inject, HostListener, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ProfileService } from '../../shared/services/profile.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { CartService } from '../../shared/services/cart.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProductResponse } from '../../shared/models/productModel';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../../shared/services/product.service';
import { Role } from '../../shared/models/customerModel';

@Component({
  selector: 'app-navbar',
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    RouterLink,
    DrawerModule,
    SidebarComponent,
    CommonModule,
    OverlayBadgeModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);
  public cartService = inject(CartService);
  private productService = inject(ProductService);

  CustomerRole = this.authService.userInfo()?.role;
  Roles = Role;

  isNavbarVisible = true;
  isAtTop = true;
  private lastScrollTop = 0;
  private scrollThreshold = 50;

  searchControl = new FormControl('');
  searchResultsShow = signal<boolean>(false);
  searchResults = signal<ProductResponse[]>([]);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.searchResultsShow.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-wrapper')) {
      this.searchResultsShow.set(false);
    }
  }

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => this.search(value));

    if (this.authService.isAuthenticated()) {
      this.cartService.getCart().subscribe({
        next: (data) => {
          this.cartService.cartProducts.set(data);
        },
      });
    }
  }

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

  closeSearch() {
    this.searchResultsShow.set(false);
    this.searchControl.setValue('', { emitEvent: false });
  }

  search(value: string | null) {
    if (value) {
      this.productService.searchProduct(value).subscribe({
        next: (data) => {
          this.searchResults.set(data);
          this.searchResultsShow.set(data.length > 0);
        },
      });
    } else {
      this.searchResults.set([]);
      this.searchResultsShow.set(false);
    }
  }
}
