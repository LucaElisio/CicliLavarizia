import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { Role } from '../shared/models/customerModel';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userInfo = authService.userInfo();
    
    if (!userInfo || !userInfo.role) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(userInfo.role)) {
      return true;
    }

    // Reindirizza alla home se l'utente non ha il ruolo necessario
    router.navigate(['/']);
    return false;
  };
};
