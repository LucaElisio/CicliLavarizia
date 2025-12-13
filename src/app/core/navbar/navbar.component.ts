import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink, MenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  menuItems!: MenuItem[];

  ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Settings',
        routerLink: '/profile',
      },
      {
        label: 'Logout',
        routerLink: '/auth/logout',
      },
    ];
  }
}
