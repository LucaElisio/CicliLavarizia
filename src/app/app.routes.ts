import { Routes } from '@angular/router';
import { AuthComponent } from './core/auth/auth.component';
import { LogoutComponent } from './core/auth/logout/logout.component';
import { authGuard } from './guards/auth.guard';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { DeleteComponent } from './core/auth/delete/delete.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
    { path: "", component: HomeComponent },
    { path: "auth/login", component: AuthComponent },
    { path: "auth/register", component: AuthComponent },
    { path: "auth/logout", component: LogoutComponent, canActivate: [authGuard] },
    { path: "auth/delete", component: DeleteComponent, canActivate: [authGuard] },
    { path: "profile", component: UserProfileComponent, canActivate: [authGuard] }
];
