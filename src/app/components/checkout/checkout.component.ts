import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, Order, OrderItem } from '../../services/order.service';
import { StripeService } from '../../services/stripe.service';
import { formatPrice, calculateItemTotal, formatTotalPrice } from '../../services/helper';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  imports: [CommonModule],
  standalone: true
})
export class CheckoutComponent implements OnInit {
  @ViewChild('cardElement') cardElement?: ElementRef;

  stripe: any;
  elements: any;
  card: any;
  clientSecret: string = '';
  paymentError: string = '';
  processingPayment: boolean = false;
  paymentSuccess: boolean = false;
  order: Order | null = null;
  orderId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private stripeService: StripeService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      this.loadOrder();
    });

    this.stripe = Stripe
    ('pk_test_51QzgnP09iJFm7rsGRVoP5ZFC9y4ZlJAVZCgCr0jIBI4jmPaTyJuVReI1lGSkiF4vq9ANjVyHMgGJZRs4MYsgGe2L00YzdJILQ3');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupStripeElements();
    }, 500);
  }

  loadOrder() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.createPaymentIntent();
      },
      error: (err) => {
        console.error('Error loading order:', err);
      }
    });
  }

  createPaymentIntent() {
    this.stripeService.createPaymentIntent(this.orderId).subscribe({
      next: (response) => {
        this.clientSecret = response.clientSecret;
        this.setupStripeElements();
      },
      error: (err) => {
        console.error('Error creating payment intent:', err);
        this.paymentError = 'Could not initialize payment. Please try again.';
      }
    });
  }

  setupStripeElements() {
    if (!this.clientSecret || !this.cardElement) return;

    this.elements = this.stripe.elements();

    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    this.card = this.elements.create('card', { style });
    this.card.mount(this.cardElement.nativeElement);

    this.card.addEventListener('change', (event: any) => {
      const displayError = document.getElementById('card-errors');
      if (event.error && displayError) {
        displayError.textContent = event.error.message;
      } else if (displayError) {
        displayError.textContent = '';
      }
    });
  }

  async handleSubmit() {
    this.processingPayment = true;
    this.paymentError = '';

    if (!this.stripe || !this.elements || !this.clientSecret) {
      this.paymentError = 'Payment system not ready. Please try again.';
      this.processingPayment = false;
      return;
    }

    try {
      const result = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: 'Customer Name'
          }
        }
      });

      if (result.error) {
        this.paymentError = result.error.message || 'An error occurred during payment.';
        this.processingPayment = false;
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          this.paymentSuccess = true;
          this.updateOrderPaymentStatus();
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      this.paymentError = 'An error occurred while processing your payment.';
      this.processingPayment = false;
    }
  }

  updateOrderPaymentStatus() {
    this.orderService.updateOrderPaymentStatus(this.orderId, 'PAID').subscribe({
      next: () => {
        this.processingPayment = false;
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        this.paymentError = 'Payment successful, but there was an error updating your order.';
        this.processingPayment = false;
      }
    });
  }

  cancelPayment() {
    this.router.navigate(['/cart']);
  }

  protected readonly formatPrice = formatPrice;
  protected readonly calculateItemTotal = calculateItemTotal;
  protected readonly formatTotalPrice = formatTotalPrice;
}