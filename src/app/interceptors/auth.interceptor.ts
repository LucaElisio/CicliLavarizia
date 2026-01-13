import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../shared/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && token) {
        if (authService.isRefreshing) {
          return authService.refreshSubject.pipe(
            filter((t): t is string => t !== null),
            take(1),
            switchMap((newToken) =>
              next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                })
              )
            )
          );
        }

        authService.isRefreshing = true;
        authService.refreshSubject.next(null);

        return authService.refresh().pipe(
          switchMap((data) => {
            authService.isRefreshing = false;

            localStorage.setItem('token', data.token);
            authService.refreshSubject.next(data.token);
            authService.changeAuthState();

            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${data.token}` },
              })
            );
          }),
          catchError(() => {
            authService.isRefreshing = false;

            localStorage.removeItem('token');
            authService.changeAuthState();
            router.navigate(['/auth/login']);

            return throwError(() => new Error('Sessione scaduta'));
          })
        );
      }

      if (err.status === 0) {
        console.warn('Server non raggiungibile');
        return throwError(() => new Error('Server offline'));
      }

      return throwError(() => err);
    })
  );
};
