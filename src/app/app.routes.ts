import { Routes } from '@angular/router';
import { AuthComponent } from './core/auth/auth.component';
import { LogoutComponent } from './core/auth/logout/logout.component';
import { authGuard } from './guards/auth.guard';
import { DeleteComponent } from './core/auth/delete/delete.component';
import { HomeComponent } from './features/home/home.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ProductComponent } from './features/product/product.component';
import { CartComponent } from './features/cart/cart';
import { ProductInfoComponent } from './features/product/product-info/product-info.component';
import { SaleComponent } from './features/sale/sale.component/sale.component';
import { OrderComponent } from './features/order/order.component';
import { LogisticComponent } from './features/logistic/logistic.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/login', component: AuthComponent },
  { path: 'auth/register', component: AuthComponent },
  { path: 'auth/logout', component: LogoutComponent, canActivate: [authGuard] },
  { path: 'auth/delete', component: DeleteComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'product', component: ProductInfoComponent },
  { path: 'sales', component: SaleComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderComponent, canActivate: [authGuard] },
  { path: 'logistic', component: LogisticComponent, canActivate: [authGuard] },

];
