import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient } from '@angular/common/http';

//theme PrimeNG
import Nora from '@primeuix/themes/nora';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
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
