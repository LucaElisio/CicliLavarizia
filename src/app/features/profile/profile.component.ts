import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { ProfileService } from '../../shared/services/profile.service';
import { CustomerInfoRequest, CustomerUpdateRequest } from '../../shared/models/customerModel';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { switchMap } from 'rxjs';

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
  visibleUpdateInfo: boolean = false;

  inputEmail: FormControl = new FormControl('', Validators.email);
  inputPassword: FormControl = new FormControl('', Validators.minLength(8));

  firstName: FormControl = new FormControl('');
  lastName: FormControl = new FormControl('');
  middleName: FormControl = new FormControl('');
  phone: FormControl = new FormControl('');
  suffix: FormControl = new FormControl('');
  salesPerson: FormControl = new FormControl('');
  companyName: FormControl = new FormControl('');

  error: string | null = null;

  showDialogEmail() {
    this.visibleEmail = true;
  }

  showDialogPassword() {
    this.visiblePassword = true;
  }

  showDialogUpdateInfo() {
    const info = this.customerInfo();
    if (info) {
      this.firstName.setValue(info.firstName || '');
      this.lastName.setValue(info.lastName || '');
      this.middleName.setValue(info.middleName || '');
      this.phone.setValue(info.phone || '');
      this.suffix.setValue(info.suffix || '');
      this.salesPerson.setValue(info.salesPerson || '');
      this.companyName.setValue(info.companyName || '');
    }
    this.visibleUpdateInfo = true;
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
          console.log(err);
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
            this.inputPassword.reset();
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

  updateCustomerInfo() {
    const updateInfo: CustomerUpdateRequest = {
      companyName: this.companyName.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
      middleName: this.middleName.value,
      phone: this.phone.value,
      salesPerson: this.salesPerson.value,
      suffix: this.suffix.value,
    };

    this.profileService
      .updateCustomerInfo(updateInfo)
      .pipe(switchMap(() => this.profileService.getCustomerInfo()))
      .subscribe({
        next: (data) => {
          this.customerInfo.set(data);
          this.visibleUpdateInfo = false;
          this.error = null;
        },
        error: (err) => {
          this.error = err.error?.detail || "Errore durante l'aggiornamento delle informazioni";
        },
      });
  }

  ngOnInit(): void {
    this.profileService.getCustomerInfo().subscribe({
      next: (data) => {
        this.customerInfo.set(data);
      },
    });
  }
}
