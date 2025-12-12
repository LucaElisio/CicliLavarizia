import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient } from '@angular/common/http';

//theme PrimeNG
import Nora from '@primeuix/themes/nora';
import { AuthService } from './features/services/auth.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      authService.changeAuthState();
    }),
    providePrimeNG({
      theme: {
        preset: Nora,
      },
      ripple: true,
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
