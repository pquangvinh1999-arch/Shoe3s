import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { computeQuote, createIdempotencyKey, submitOrder, validPhone } from '../apps/web/src/features/booking/api.ts';
import { getServiceCatalog } from '../js/service-catalog';

const catalog = getServiceCatalog();

describe('P04-T02 booking funnel — validation', () => {
  it('accepts domestic and +84 phone formats', () => {
    expect(validPhone('0901234567')).toBe(true);
    expect(validPhone('+84901234567')).toBe(true);
    expect(validPhone('090 123 4567')).toBe(true);
  });

  it('rejects invalid phones', () => {
    expect(validPhone('123')).toBe(false);
    expect(validPhone('abc')).toBe(false);
    expect(validPhone('')).toBe(false);
  });
});

describe('P04-T02 booking funnel — quote', () => {
  it('computes total from selected active services only', () => {
    const free = catalog.filter((service) => service.priceVnd === 0);
    const paid = catalog.filter((service) => service.priceVnd && service.priceVnd > 0);
    const quote = computeQuote([...free, ...paid]);
    const expected = paid.reduce((sum, service) => sum + (service.priceVnd ?? 0), 0);
    expect(quote.totalVnd).toBe(expected);
    expect(quote.items.length).toBe(free.length + paid.length);
  });

  it('maps each item with catalog pricing', () => {
    const quote = computeQuote([catalog[0]]);
    expect(quote.items[0]).toEqual({
      service_id: catalog[0].id,
      name: catalog[0].name,
      qty: 1,
      unit_price_vnd: catalog[0].priceVnd,
    });
  });
});

describe('P04-T02 booking funnel — idempotency', () => {
  it('generates a fresh UUID per call', () => {
    const a = createIdempotencyKey();
    const b = createIdempotencyKey();
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
    expect(a).not.toBe(b);
  });
});

describe('P04-T02 booking funnel — submit', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts canonical order payload and returns result', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          order_id: 'ORD-001',
          status: 'pending',
          quote: { total_vnd: 150000, items: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const realId = catalog[0].id;
    const result = await submitOrder({
      customer_name: 'Minh Anh',
      phone: '0901234567',
      service_ids: [realId],
      pickup_address: '123 Nguyễn Huệ',
      note: 'Ghé qua 14h',
      turnstile_token: 'local-demo-token',
      idempotency_key: createIdempotencyKey(),
    });

    const call = vi.mocked(fetch).mock.calls[0];
    expect(call[0]).toBe('/api/orders');
    const body = JSON.parse(call[1].body);
    expect(body).toMatchObject({
      customer_name: 'Minh Anh',
      phone: '84901234567',
      service_ids: [realId],
      pickup_address: '123 Nguyễn Huệ',
    });
    expect(body.idempotency_key).toMatch(/^[0-9a-f-]{36}$/);
    expect(result.ok).toBe(true);
    expect(result.order_id).toBe('ORD-001');
  });

  it('surfaces the server error message with code', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, code: 'RATE_LIMITED', message: 'Quá nhiều yêu cầu, thử lại sau' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(
      submitOrder({
      customer_name: 'Minh Anh',
      phone: '84901234567',
        service_ids: [catalog[0].id],
        turnstile_token: 'local-demo-token',
        idempotency_key: createIdempotencyKey(),
      }),
    ).rejects.toThrow('Quá nhiều yêu cầu, thử lại sau');
  });
});
