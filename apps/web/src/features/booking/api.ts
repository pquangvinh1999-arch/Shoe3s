import { buildLegacyOrderData, normalizeVietnamPhone, orderRequestSchema } from '../../../../../js/order-schema';
import type { Service } from '../../../../../js/service-catalog';

export type OrderRequest = {
  customer_name: string;
  phone: string;
  service_ids: string[];
  pickup_address?: string;
  note?: string;
  turnstile_token: string;
  idempotency_key: string;
};

export type QuoteItem = {
  service_id: string;
  name: string;
  qty: number;
  unit_price_vnd: number | null;
};

export type SubmitResult = {
  ok: true;
  order_id: string;
  status: string;
  quote: { total_vnd: number; items: QuoteItem[] };
};

export function createIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function validPhone(phone: string): boolean {
  const normalized = normalizeVietnamPhone(phone);
  return /^84\d{9}$/.test(normalized);
}

export function computeQuote(services: Service[]): { totalVnd: number; items: QuoteItem[] } {
  const items = services
    .filter((service) => service.active)
    .map((service) => ({
      service_id: service.id,
      name: service.name,
      qty: 1,
      unit_price_vnd: service.priceVnd,
    }));
  const totalVnd = services.reduce((sum, service) => sum + (service.priceVnd ?? 0), 0);
  return { totalVnd, items };
}

export async function submitOrder(request: OrderRequest): Promise<SubmitResult> {
  const parsed = orderRequestSchema.parse(request);
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.message || 'Lỗi tạo đơn hàng');
  }
  return result as SubmitResult;
}

export { buildLegacyOrderData };
