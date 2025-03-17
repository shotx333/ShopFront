import { OrderItem } from "./order.service";

let baseUrl = 'http://localhost:8080';
export default baseUrl; 

export function formatPrice(price: number | undefined): string {
  return price ? price.toFixed(2) : '0.00';
}

export function calculateItemTotal(item: OrderItem): string {
  const price = item.price || 0;
  const quantity = item.quantity || 0;
  return (price * quantity).toFixed(2);
}

export function formatTotalPrice(totalPrice: number | undefined): string {
  return totalPrice ? totalPrice.toFixed(2) : '0.00';
}
