import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../features/services/auth.service';
import { TokenDecoded } from '../../shared/models/tokenModel';

@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  public userInfo = signal<TokenDecoded | null>(null)

  ngOnInit(): void {
    this.userInfo.set(this.authService.getTokenInfo());
  }

}
