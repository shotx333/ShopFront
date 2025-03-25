import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminProductListComponent } from './components/admin-product-list/admin-product-list.component';
import { AdminCategoryListComponent } from './components/admin-category-list/admin-category-list.component';
import { AdminGuard } from '../guards/admin.guard';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { CategoryFormComponent } from './components/category-form/category-form.component';

const routes: Routes = [
  { 
    path: '', 
    component: AdminDashboardComponent, 
    canActivate: [AdminGuard] 
  },
  { 
    path: 'products', 
    component: AdminProductListComponent, 
    canActivate: [AdminGuard] 
  },
  { 
    path: 'products/new', 
    component: ProductFormComponent, 
    canActivate: [AdminGuard] 
  },
  { 
    path: 'categories', 
    component: AdminCategoryListComponent, 
    canActivate: [AdminGuard] 
  },
  { 
    path: 'categories/new', 
    component: CategoryFormComponent, 
    canActivate: [AdminGuard] 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }