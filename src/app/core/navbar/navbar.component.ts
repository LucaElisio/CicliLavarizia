import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  public authService = inject(AuthService);

}
