import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { orderRequestSchema } from '../js/order-schema.js';
import {
  onRequestPost,
  createSuccessResponse,
  sha256Hex,
  computeIdempotencyHash,
  verifyTurnstile,
  clientIpFromRequest,
  checkRateLimit,
} from '../functions/api/orders.js';
import { escapeTelegramHtml, sendTelegramOrderNotification } from '../functions/api/telegram.js';

const RATE_MAX = 20;

const VALID_PAYLOAD = {
  customer_name: 'Test User',
  phone: '0382878953',
  service_ids: ['service-cleaning', 'service-sole-stitch'],
  turnstile_token: 'turnstile-token-1',
  idempotency_key: '9f1d7c0e-4c49-4b0d-bdfe-5f3e2519a1a1',
};

const ENV = {
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'srk',
  TURNSTILE_SECRET_KEY: 'tsk',
  TELEGRAM_BOT_TOKEN: 'tbt',
  TELEGRAM_CHAT_ID: 'chat-id',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function makeContext(payload = VALID_PAYLOAD, env = ENV, method = 'POST') {
  const request = new Request('http://local/api/orders', {
    method,
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.5' },
    body: method === 'POST' ? JSON.stringify(payload) : undefined,
  });
  return { request, env };
}

describe('P03-T01 secure order API', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('telegram HTML escaping', () => {
    it('escapes html-sensitive characters', () => {
      expect(escapeTelegramHtml('<b>&"\'</b>')).toBe('&lt;b&gt;&amp;&quot;&#39;&lt;/b&gt;');
      expect(escapeTelegramHtml('Vệ sinh toàn diện')).toBe('Vệ sinh toàn diện');
    });

    it('escapes customer input before building telegram payload', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
      const result = await sendTelegramOrderNotification(
        { customer_name: '<img src=x onerror=alert(1)>', phone: '0382878953', services: 'Vệ sinh', total: 69000 },
        ENV
      );
      expect(result.sent).toBe(true);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toContain('api.telegram.org');
      const body = JSON.parse(init.body);
      expect(body.text).toContain('&lt;img src=x onerror=alert(1)&gt;');
      expect(body.parse_mode).toBe('HTML');
    });

    it('returns missing-config result when telegram env is absent', async () => {
      const result = await sendTelegramOrderNotification({ customer_name: 'A' }, {});
      expect(result).toEqual({ sent: false, reason: 'missing-config' });
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('idempotency hash', () => {
    it('is deterministic for identical payloads', async () => {
      const a = await computeIdempotencyHash(VALID_PAYLOAD);
      const b = await computeIdempotencyHash({ ...VALID_PAYLOAD, note: undefined });
      expect(a).toBe(b);
      expect(a).toMatch(/^[0-9a-f]{64}$/);
    });

    it('changes when payload changes', async () => {
      const a = await computeIdempotencyHash(VALID_PAYLOAD);
      const b = await computeIdempotencyHash({ ...VALID_PAYLOAD, note: 'khác' });
      expect(a).not.toBe(b);
    });

    it('sha256Hex produces expected digest', async () => {
      expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    });
  });

  describe('turnstile verification', () => {
    it('accepts a successful siteverify response', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true }));
      const result = await verifyTurnstile('token', 'secret', '1.2.3.4');
      expect(result.ok).toBe(true);
      const [, init] = fetchMock.mock.calls[0];
      expect(init.body.toString()).toContain('secret=secret');
      expect(init.body.toString()).toContain('remoteip=1.2.3.4');
    });

    it('rejects when siteverify fails', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: false }));
      const result = await verifyTurnstile('bad-token', 'secret');
      expect(result.ok).toBe(false);
    });

    it('fails closed when secret is missing', async () => {
      const result = await verifyTurnstile('token', null);
      expect(result.ok).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('rate limiting', () => {
    it('allows requests within window and blocks beyond limit', () => {
      const now = 1_000_000_000_000;
      let allowed = true;
      for (let i = 0; i < 20; i++) allowed = checkRateLimit('ip-hash', now);
      expect(allowed).toBe(true);
      expect(checkRateLimit('ip-hash', now)).toBe(false);
      expect(checkRateLimit('other-hash', now)).toBe(true);
      expect(checkRateLimit('ip-hash', now + 60_000)).toBe(true);
    });
  });

  describe('client ip detection', () => {
    it('prefers CF-Connecting-IP and falls back to x-forwarded-for', () => {
      const cf = new Request('http://local', { headers: { 'CF-Connecting-IP': '10.0.0.1' } });
      expect(clientIpFromRequest(cf)).toBe('10.0.0.1');

      const fwd = new Request('http://local', { headers: { 'x-forwarded-for': '10.0.0.2, 10.0.0.3' } });
      expect(clientIpFromRequest(fwd)).toBe('10.0.0.2');

      expect(clientIpFromRequest(new Request('http://local'))).toBe('unknown');
    });
  });

  describe('onRequestPost handler', () => {
    it('rejects non-POST methods', async () => {
      const context = makeContext(VALID_PAYLOAD, ENV, 'GET');
      const response = await onRequestPost(context);
      expect(response.status).toBe(405);
      const body = await response.json();
      expect(body.code).toBe('INVALID_METHOD');
      expect(body.request_id).toBeTruthy();
    });

    it('rejects non-JSON content type', async () => {
      const request = new Request('http://local/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '{}',
      });
      const response = await onRequestPost({ request, env: ENV });
      expect(response.status).toBe(415);
      expect((await response.json()).code).toBe('VALIDATION_ERROR');
    });

    it('rejects oversized bodies', async () => {
      const big = { ...VALID_PAYLOAD, note: 'x'.repeat(20_000) };
      const response = await onRequestPost(makeContext(big, ENV));
      expect(response.status).toBe(413);
    });

    it('rejects malformed JSON', async () => {
      const request = new Request('http://local/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{not-json',
      });
      const response = await onRequestPost({ request, env: ENV });
      expect(response.status).toBe(400);
      expect((await response.json()).code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid payload with VALIDATION_ERROR', async () => {
      const bad = { ...VALID_PAYLOAD, phone: 'abc', service_ids: ['service-unknown'] };
      const response = await onRequestPost(makeContext(bad, ENV));
      expect(response.status).toBe(400);
      expect((await response.json()).code).toBe('VALIDATION_ERROR');
    });

    it('returns BOT_CHECK_FAILED when turnstile rejects', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ success: false }));
      const response = await onRequestPost(makeContext(VALID_PAYLOAD, ENV));
      expect(response.status).toBe(400);
      expect((await response.json()).code).toBe('BOT_CHECK_FAILED');
    });

    it('creates an order and returns quote when bot check passes', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ success: true })) // turnstile
        .mockResolvedValueOnce(jsonResponse([])) // existing order lookup
        .mockResolvedValueOnce(jsonResponse([{ id: 'order-123' }])) // insert
        .mockResolvedValueOnce(jsonResponse({ ok: true })); // telegram

      const response = await onRequestPost(makeContext(VALID_PAYLOAD, ENV));
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(body.order_id).toBe('order-123');
      expect(body.status).toBe('Chờ thanh toán');
      expect(body.quote.total_vnd).toBe(168000);
      expect(body.quote.items).toEqual([
        { service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', qty: 1, unit_price_vnd: 69000 },
        { service_id: 'service-sole-stitch', name: 'Khâu đế', qty: 1, unit_price_vnd: 99000 },
      ]);

      const insertCall = fetchMock.mock.calls[2];
      expect(insertCall[0]).toContain('/rest/v1/orders');
      const insertBody = JSON.parse(insertCall[1].body)[0];
      expect(insertBody.total).toBe(168000);
      expect(insertBody.status).toBe('Chờ thanh toán');
      expect(insertBody.source).toBe('web-3d-booking');
      expect(insertBody.idempotency_key).toBe(VALID_PAYLOAD.idempotency_key);
      expect(insertBody.idempotency_payload_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(insertBody.services).toBe('Vệ sinh toàn diện, Khâu đế');
    });

    it('replays the original order for the same idempotency key and payload', async () => {
      const parsed = orderRequestSchema.parse(VALID_PAYLOAD);
      const hash = await computeIdempotencyHash(parsed);
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ success: true })) // turnstile
        .mockResolvedValueOnce(jsonResponse([{ id: 'existing-1', idempotency_payload_hash: hash }])); // lookup

      const response = await onRequestPost(makeContext(VALID_PAYLOAD, ENV));
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.ok).toBe(true);
      expect(body.order_id).toBe('existing-1');
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0]).toContain('idempotency_key=eq.');
      expect(fetchMock.mock.calls[1][1].method ?? 'GET').toBe('GET');
    });

    it('returns IDEMPOTENCY_CONFLICT for same key with different payload', async () => {
      const parsed = orderRequestSchema.parse(VALID_PAYLOAD);
      const hash = await computeIdempotencyHash(parsed);
      const different = { ...VALID_PAYLOAD, note: 'changed payload' };
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ success: true })) // turnstile
        .mockResolvedValueOnce(jsonResponse([{ id: 'existing-1', idempotency_payload_hash: hash }])); // lookup

      const response = await onRequestPost(makeContext(different, ENV));
      expect(response.status).toBe(409);
      expect((await response.json()).code).toBe('IDEMPOTENCY_CONFLICT');
    });

    it('returns INTERNAL_ERROR without leaking internals when insert fails', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ success: true })) // turnstile
        .mockResolvedValueOnce(jsonResponse([])) // lookup
        .mockResolvedValueOnce(jsonResponse({ message: 'column does not exist' }, 400)); // insert fails

      const response = await onRequestPost(makeContext(VALID_PAYLOAD, ENV));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('INTERNAL_ERROR');
      expect(body.message).not.toContain('column does not exist');
    });

    it('skips bot check when ALLOW_TURNSTILE_SKIP is true', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse([])) // lookup
        .mockResolvedValueOnce(jsonResponse([{ id: 'order-2' }])) // insert
        .mockResolvedValueOnce(jsonResponse({ ok: true })); // telegram

      const env = { ...ENV, ALLOW_TURNSTILE_SKIP: 'true' };
      const response = await onRequestPost(makeContext(VALID_PAYLOAD, env));
      expect(response.status).toBe(200);
      const urls = fetchMock.mock.calls.map(([url]) => String(url));
      expect(urls.some((url) => url.includes('turnstile'))).toBe(false);
    });

    it('returns 429 when rate limited', async () => {
      fetchMock.mockImplementation(() => Promise.resolve(jsonResponse([])));
      const env = { ...ENV, ALLOW_TURNSTILE_SKIP: 'true' };
      for (let i = 0; i < RATE_MAX; i++) {
        await onRequestPost(makeContext(VALID_PAYLOAD, env));
      }
      const response = await onRequestPost(makeContext(VALID_PAYLOAD, env));
      expect(response.status).toBe(429);
      expect((await response.json()).code).toBe('RATE_LIMITED');
    });
  });

  describe('createSuccessResponse', () => {
    it('returns the documented success envelope', async () => {
      const orderData = {
        status: 'Chờ thanh toán',
        total: 69000,
        service_items: [{ service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', qty: 1, unit_price_vnd: 69000 }],
      };
      const response = createSuccessResponse('abc', orderData, 'req-1');
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({
        ok: true,
        order_id: 'abc',
        status: 'Chờ thanh toán',
        request_id: 'req-1',
        quote: { total_vnd: 69000, items: [{ service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', qty: 1, unit_price_vnd: 69000 }] },
      });
    });
  });
});
