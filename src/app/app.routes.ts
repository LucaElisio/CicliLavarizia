import { Routes } from '@angular/router';
import { AuthComponent } from './core/auth/auth.component';
import { LogoutComponent } from './core/auth/logout/logout.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { DeleteComponent } from './core/auth/delete/delete.component';
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ProductComponent } from './features/product/product.component';
import { CartComponent } from './features/cart/cart';
import { ProductInfoComponent } from './features/product/product-info/product-info.component';
import { SaleComponent } from './features/sale/sale.component/sale.component';
import { OrderComponent } from './features/order/order.component';
import { LogisticComponent } from './features/logistic/logistic.component';
import { AssistantComponent } from './features/saleAssistant/assistant.component/assistant.component';
import { Role } from './shared/models/customerModel';
import { PersonalReviews } from './features/profile/personal-reviews/personal-reviews';
import { ErrorComponent } from './core/error/error.component';


export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [roleGuard([Role.Guest, Role.Customer, Role.Admin])] },
  { path: 'auth/login', component: AuthComponent },
  { path: 'auth/register', component: AuthComponent },
  { path: 'auth/logout', component: LogoutComponent, canActivate: [authGuard] },
  { path: 'auth/delete', component: DeleteComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductComponent, canActivate: [roleGuard([Role.Customer, Role.Admin, Role.Guest])] },
  { path: 'cart', component: CartComponent, canActivate: [roleGuard([Role.Admin, Role.Customer, Role.Guest])] },
  { path: 'sales', component: SaleComponent, canActivate: [authGuard, roleGuard([Role.Admin, Role.Customer])] },
  { path: 'orders', component: OrderComponent, canActivate: [authGuard, roleGuard([Role.Admin, Role.Customer])] },
  { path: 'logistic', component: LogisticComponent, canActivate: [authGuard, roleGuard([Role.Admin, Role.Logistic])] },
  { path: 'product', component: ProductInfoComponent, canActivate: [roleGuard([Role.Customer, Role.Admin, Role.Guest])] },
  { path: 'sales', component: SaleComponent, canActivate: [authGuard, roleGuard([Role.Admin, Role.Customer])] },  
  { path: 'sales-assistant', component: AssistantComponent, canActivate: [authGuard, roleGuard([Role.SaleAssistant, Role.Admin])] },
  {path: 'personal-reviews', component: PersonalReviews, canActivate: [authGuard, roleGuard([Role.Customer, Role.Admin])]},
  { path: 'error', component: ErrorComponent },
];
