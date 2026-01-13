import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { LoginRequest, RegisterRequest } from '../../shared/models/authModel';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-auth',
  imports: [
    DialogModule,
    InputGroupAddonModule,
    ProgressSpinnerModule,
    MessageModule,
    CardModule,
    PasswordModule,
    InputTextModule,
    InputGroupModule,
    FloatLabelModule,
    ButtonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  isLoginPage: boolean = false;
  authForm!: FormGroup;
  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  inputPassword: FormControl = new FormControl('', Validators.minLength(8));
  inputEmail: FormControl = new FormControl('', Validators.email);
  visible: boolean = false;

  ngOnInit(): void {
    const url = this.activatedRoute.url.subscribe({
      next: (data) => {
        this.isLoginPage = data[data.length - 1].path === 'login';
        this.generateForm();
      },
    });
  }

  private generateForm() {
    if (this.isLoginPage) {
      this.authForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
      });
    } else {
      this.authForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      });
    }
  }

  updatePassword() {
    if (this.inputPassword.valid && this.inputEmail.valid) {
      const userData = {
        emailAddress: this.inputEmail.value,
        password: this.inputPassword.value,
      };
      this.authService.updatePassword(userData).subscribe({
        next: () => {
          this.visible = false;
          this.error.set(null);
        },
        error: (err) => {
          this.error.set(err.error.detail);
        },
      });
    }
  }

  showDialog() {
    this.visible = true;
  }

  onSubmit() {
    this.isLoading.set(true);
    if (this.isLoginPage && this.authForm.valid) {
      const userData: LoginRequest = this.authForm.value;
      this.authService.login(userData).subscribe({
        next: (data) => {
          localStorage.setItem('token', data.token);
          this.authService.changeAuthState();
          this.error.set(null);
          this.authForm.reset();
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.error.detail);
        },
      });
    } else if (!this.isLoginPage && this.authForm.valid) {
      const userData: RegisterRequest = this.authForm.value;
      this.authService.register(userData).subscribe({
        next: () => {
          this.error.set(null);
          this.authForm.reset();
          this.isLoading.set(false);
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.error.set(err.error.detail);
        },
      });
    }
  }
}
