import { Routes } from '@angular/router';
import { AuthComponent } from './core/auth/auth.component';

export const routes: Routes = [
    { path: "auth/login", component: AuthComponent },
    { path: "auth/register", component: AuthComponent }
];
