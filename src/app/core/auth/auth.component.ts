import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../features/services/auth.service';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoginRequest, RegisterRequest } from '../../shared/models/authModel';
import { MessageModule } from 'primeng/message';


@Component({
  selector: 'app-auth.component',
  imports: [InputGroupAddonModule, MessageModule, CardModule, PasswordModule, InputTextModule, InputGroupModule, FloatLabelModule, ButtonModule, RouterLink, ReactiveFormsModule],
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

  ngOnInit(): void {
    const url = this.activatedRoute.url.subscribe({
      next: (data) => {
        this.isLoginPage = data[data.length - 1].path === 'login';
      }
    })
    this.generateForm();
  }

  private generateForm() {
    if (this.isLoginPage) {
      this.authForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      })
    } else {
      this.authForm = this.formBuilder.group({
        emailAddress: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.min(8)]],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        confirmPassword: ['', Validators.required]
      })
    }
  }


  onSubmit() {
    if (this.isLoginPage && this.authForm.valid) {
      const userData: LoginRequest = this.authForm.value;
      this.authService.login(userData).subscribe({
        next: (data) => {
          localStorage.setItem('token', data.token);
          this.authService.changeAuthState();
          this.error.set(null);
          this.authForm.reset();
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error.set(err.error.detail);
        }
      });
    } else if (!this.isLoginPage && this.authForm.valid) {
      const userData: RegisterRequest = this.authForm.value;
      this.authService.register(userData).subscribe({
        next: () => {
          this.error.set(null);
          this.authForm.reset();
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.error.set(err.error.detail);
        }
      });
    }
  }
}
