import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './admin/components/product-form/product-form.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { CategoryFormComponent } from './admin/components/category-form/category-form.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { EditAccountComponent } from './components/edit-account/edit-account.component';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  { path: 'login',            component: LoginComponent },
  { path: 'register',         component: RegisterComponent },

  { path: 'products',         component: ProductListComponent },
  { path: 'products/new',     component: ProductFormComponent },
  { path: 'products/:id',     component: ProductDetailComponent },

  { path: 'categories',       component: CategoryListComponent },
  { path: 'categories/new',   component: CategoryFormComponent },

  { path: 'orders/new',       component: OrderFormComponent },
  { path: 'orders',           component: OrderListComponent },

  { path: 'cart',             component: CartComponent },
  { path: 'checkout/:id',     component: CheckoutComponent },

  { path: 'change-password',  component: ChangePasswordComponent },
  
  { path: 'account/edit', component: EditAccountComponent },

  /* Lazy-loaded admin section */
  { path: 'admin',            loadChildren: () =>
      import('./admin/admin.module').then(m => m.AdminModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
