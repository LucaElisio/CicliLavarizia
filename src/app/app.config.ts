import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

//theme PrimeNG
import Aura from '@primeuix/themes/aura';
import { AuthService } from './shared/services/auth.service';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorsInterceptor } from './interceptors/errors.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor, errorsInterceptor])),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      authService.changeAuthState();
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
      ripple: true,
    }),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
};
