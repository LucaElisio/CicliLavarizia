import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { CustomerInfoRequest } from '../../shared/models/customerModel';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-profile',
  imports: [
    PasswordModule,
    CardModule,
    InputTextModule,
    RouterLink,
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  public profileService = inject(ProfileService);

  customerInfo = signal<CustomerInfoRequest | null>(null);
  visibleEmail: boolean = false;
  visiblePassword: boolean = false;

  inputEmail: FormControl = new FormControl('', Validators.email);
  inputPassword: FormControl = new FormControl('', Validators.minLength(8));

  error: string | null = null;

  showDialogEmail() {
    this.visibleEmail = true;
  }
  showDialogPassword() {
    this.visiblePassword = true;
  }

  updateEmail() {
    if (this.inputEmail.valid) {
      const newEmailAddress = { newEmailAddress: this.inputEmail.value };
      this.authService.updateEmail(newEmailAddress).subscribe({
        next: () => {
          this.authService.refresh().subscribe({
            next: (data) => {
              localStorage.setItem('token', data.token);
              this.authService.changeAuthState();
              this.inputEmail.reset();
              this.visibleEmail = false;
              this.error = null;
            },
          });
        },
        error: (err) => {
          this.error = err.error.detail;
        },
      });
    }
  }

  updatePassword() {
    if (this.inputPassword.valid) {
      const email = this.authService.userInfo()?.email;
      if (email) {
        const userData = {
          emailAddress: email,
          password: this.inputPassword.value,
        };
        this.authService.updatePassword(userData).subscribe({
          next: () => {
            this.visiblePassword = false;
            this.error = null;
          },
          error: (err) => {
            this.error = err.error.detail;
          },
        });
      }
    }
  }

  ngOnInit(): void {
    this.profileService.getCustomerInfo().subscribe({
      next: (data) => {
        this.customerInfo.set(data);
      },
    });
  }
}
