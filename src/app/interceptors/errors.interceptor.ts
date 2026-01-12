import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      // Evita loop se la richiesta è già verso la pagina di errore
      if (req.url.includes('/error')) {
        return throwError(() => error);
      }

      // Naviga verso una pagina dedicata agli errori, passando il codice
      setTimeout(() => {
        router.navigate(['/error'], {
          queryParams: { code: error.status }
        });
      }, 0);

      return throwError(() => error);
    })
  );
};