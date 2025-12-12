import { Routes } from '@angular/router';
import { AuthComponent } from './core/auth/auth.component';
import { LogoutComponent } from './core/auth/logout/logout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: "auth/login", component: AuthComponent },
    { path: "auth/register", component: AuthComponent },
    { path: "auth/logout", component: LogoutComponent, canActivate: [authGuard] }
];
