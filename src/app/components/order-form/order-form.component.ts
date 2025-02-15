import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  imports: [ReactiveFormsModule, CommonModule]
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.addItem();
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem() {
    const itemGroup = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  placeOrder() {
    if (this.orderForm.invalid) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    this.orderService.placeOrder(this.orderForm.value.items).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: () => this.error = 'Error placing order'
    });
  }
}
