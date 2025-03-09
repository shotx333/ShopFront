import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminProductListComponent } from './components/admin-product-list/admin-product-list.component';
import { AdminCategoryListComponent } from './components/admin-category-list/admin-category-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AdminDashboardComponent,
    AdminProductListComponent,
    AdminCategoryListComponent
  ]
})
export class AdminModule { }
