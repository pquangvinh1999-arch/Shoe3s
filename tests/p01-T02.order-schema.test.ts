import { describe, expect, it } from 'vitest';
import {
  orderRequestSchema,
  normalizeVietnamPhone,
  serviceIdsToLegacyServices,
  legacyServicesToServiceIds,
  calculateStructuredItemsTotal,
  buildLegacyOrderData,
  ORDER_STATUS,
} from '../js/order-schema.js';

describe('P01-T02 order schema and compatibility adapter', () => {
  it('normalizes VN phone numbers', () => {
    expect(normalizeVietnamPhone('0382878953')).toBe('84382878953');
    expect(normalizeVietnamPhone('+84 382 878 953')).toBe('84382878953');
  });

  it('validates a minimal order request', () => {
    const payload = {
      customer_name: 'Test User',
      phone: '0382878953',
      service_ids: ['service-cleaning'],
      turnstile_token: 'token-123',
      idempotency_key: '9f1d7c0e-4c49-4b0d-bdfe-5f3e2519a1a1',
    };

    const result = orderRequestSchema.parse(payload);
    expect(result.customer_name).toBe('Test User');
    expect(result.phone).toBe('84382878953');
    expect(result.service_ids).toEqual(['service-cleaning']);
  });

  it('rejects invalid service ids', () => {
    expect(() =>
      orderRequestSchema.parse({
        customer_name: 'Test',
        phone: '0382878953',
        service_ids: ['service-unknown'],
        turnstile_token: 't',
        idempotency_key: '6dd1dd5d-7759-4c09-bce0-fb38ee0cc3f4',
      })
    ).toThrow();
  });

  it('round-trips legacy services string to service ids and back', () => {
    const ids = legacyServicesToServiceIds('Vệ sinh toàn diện, Khâu đế');
    expect(ids).toEqual(['service-cleaning', 'service-sole-stitch']);
    expect(serviceIdsToLegacyServices(ids)).toBe('Vệ sinh toàn diện, Khâu đế');
  });

  it('calculates total from structured items', () => {
    const total = calculateStructuredItemsTotal([
      { service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', qty: 1, priceVnd: 69000, subtotal: 69000 },
      { service_id: 'service-sole-stitch', name: 'Khâu đế', qty: 1, priceVnd: 99000, subtotal: 99000 },
    ]);
    expect(total).toBe(168000);
  });

  it('builds legacy-compatible order data from request payload', () => {
    const request = {
      customer_name: 'Test User',
      phone: '0382878953',
      service_ids: ['service-cleaning', 'service-sole-stitch'],
      pickup_address: '123 Nguyễn Văn Cừ, Quận 1',
      note: 'Giữ kỹ phần đế',
      turnstile_token: 'token-123',
      idempotency_key: 'c3f04595-77a0-4d64-aeb9-c2fa610b8ea6',
    };

    const order = buildLegacyOrderData(request);
    expect(order.customer_name).toBe('Test User');
    expect(order.phone).toBe('84382878953');
    expect(order.pickup_address).toBe('123 Nguyễn Văn Cừ, Quận 1');
    expect(order.note).toBe('Giữ kỹ phần đế');
    expect(order.services).toBe('Vệ sinh toàn diện, Khâu đế');
    expect(order.service_ids).toEqual(['service-cleaning', 'service-sole-stitch']);
    expect(order.total).toBe(168000);
    expect(order.status).toBe(ORDER_STATUS.NEW);
    expect(order.created_at).toBeTruthy();
  });
});
