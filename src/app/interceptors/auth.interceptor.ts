import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (req.url.startsWith("/auth/login") || req.url.startsWith("/auth/register")) {
    return next(req);
  }

  const token = localStorage.getItem("token");
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && token) {
        return authService.refresh().pipe(
          switchMap((data) => {
            localStorage.setItem("token", data.token);
            authService.changeAuthState();
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${data.token}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            localStorage.removeItem('token');
            authService.changeAuthState();
            router.navigate(['/auth/login']);
            return throwError(() => new Error("Sessione scaduta, effettua il login"));
          })
        );
      } else if (err.status === 0) {
        console.warn("Nessuna connessione o server offline");
        return throwError(() => new Error("Server non raggiungibile"));
      }

      return throwError(() => err);
    })
  );
};
