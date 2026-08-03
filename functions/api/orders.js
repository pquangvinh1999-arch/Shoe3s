import { orderRequestSchema, buildLegacyOrderData, buildSupabaseOrderPayload } from '../../js/order-schema.js';
import { sendTelegramOrderNotification } from './telegram.js';

const MAX_BODY_BYTES = 16384;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_PER_WINDOW = 20;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const rateBuckets = new Map();

function createErrorResponse(code, message, status = 400, requestId = crypto.randomUUID()) {
  return new Response(JSON.stringify({ ok: false, code, message, request_id: requestId }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createSuccessResponse(orderId, orderData, requestId) {
  return new Response(
    JSON.stringify({
      ok: true,
      order_id: orderId,
      status: orderData.status,
      request_id: requestId,
      quote: {
        total_vnd: orderData.total,
        items: orderData.service_items.map((item) => ({
          service_id: item.service_id,
          name: item.name,
          qty: item.qty,
          unit_price_vnd: item.unit_price_vnd,
        })),
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function computeIdempotencyHash(payload) {
  const canonical = {
    customer_name: payload.customer_name,
    phone: payload.phone,
    service_ids: payload.service_ids,
    pickup_address: payload.pickup_address || null,
    note: payload.note || null,
  };
  return sha256Hex(JSON.stringify(canonical));
}

export async function verifyTurnstile(token, secret, remoteIp) {
  if (!secret) {
    return { ok: false, code: 'BOT_CHECK_FAILED', message: 'Bot check is not configured' };
  }
  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  if (remoteIp) {
    form.set('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  if (!response.ok) {
    return { ok: false, code: 'BOT_CHECK_FAILED', message: 'Bot check failed' };
  }

  const result = await response.json();
  return {
    ok: result.success === true,
    code: 'BOT_CHECK_FAILED',
    message: 'Bot check failed',
  };
}

export function clientIpFromRequest(request) {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export function checkRateLimit(ipHash, now = Date.now()) {
  const windowStart = Math.floor(now / RATE_WINDOW_MS) * RATE_WINDOW_MS;
  const bucket = rateBuckets.get(ipHash);
  if (!bucket || bucket.window !== windowStart) {
    rateBuckets.set(ipHash, { window: windowStart, count: 1 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= RATE_MAX_PER_WINDOW;
}

async function findExistingOrder(apiBase, supabaseKey, idempotencyKey) {
  const url = `${apiBase}/orders?select=id,idempotency_payload_hash&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}`;
  const response = await fetch(url, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const requestId = crypto.randomUUID();

  if (request.method !== 'POST') {
    return createErrorResponse('INVALID_METHOD', 'Only POST is allowed', 405, requestId);
  }

  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return createErrorResponse('VALIDATION_ERROR', 'Content-Type must be application/json', 415, requestId);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return createErrorResponse('VALIDATION_ERROR', 'Request body is too large', 413, requestId);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return createErrorResponse('VALIDATION_ERROR', 'Request body must be valid JSON', 400, requestId);
  }

  let parsed;
  try {
    parsed = orderRequestSchema.parse(payload);
  } catch (err) {
    const message = err.issues && err.issues.length > 0 ? err.issues[0].message : 'Request validation failed';
    return createErrorResponse('VALIDATION_ERROR', message, 400, requestId);
  }

  const ip = clientIpFromRequest(request);
  const ipHash = await sha256Hex(ip);
  if (!checkRateLimit(ipHash)) {
    return createErrorResponse('RATE_LIMITED', 'Too many requests', 429, requestId);
  }

  const skipBotCheck = env.ALLOW_TURNSTILE_SKIP === 'true';
  if (!skipBotCheck) {
    const turnstile = await verifyTurnstile(parsed.turnstile_token, env.TURNSTILE_SECRET_KEY, ip);
    if (!turnstile.ok) {
      return createErrorResponse('BOT_CHECK_FAILED', turnstile.message, 400, requestId);
    }
  }

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return createErrorResponse('INTERNAL_ERROR', 'Server configuration is incomplete', 500, requestId);
  }

  const apiBase = `${supabaseUrl.replace(/\/$/, '')}/rest/v1`;
  const idempotencyHash = await computeIdempotencyHash(parsed);

  const existing = await findExistingOrder(apiBase, supabaseKey, parsed.idempotency_key);
  if (existing) {
    if (existing.idempotency_payload_hash && existing.idempotency_payload_hash !== idempotencyHash) {
      return createErrorResponse('IDEMPOTENCY_CONFLICT', 'Idempotency key was already used with a different payload', 409, requestId);
    }
    const orderData = buildLegacyOrderData(parsed);
    return createSuccessResponse(existing.id, orderData, requestId);
  }

  const orderData = buildLegacyOrderData(parsed);
  const insertPayload = {
    ...buildSupabaseOrderPayload(parsed),
    pricing_version: 'catalog-v1',
    source: 'web-3d-booking',
    idempotency_key: parsed.idempotency_key,
    idempotency_payload_hash: idempotencyHash,
  };

  const insertResponse = await fetch(`${apiBase}/orders`, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify([insertPayload]),
  });

  if (!insertResponse.ok) {
    let conflictKey = null;
    try {
      const err = await insertResponse.json();
      if (Array.isArray(err) && err[0]?.code === '23505' && /idempotency_key/i.test(err[0]?.message || '')) {
        conflictKey = parsed.idempotency_key;
      }
    } catch {
      // ignore body parse failure
    }
    if (conflictKey) {
      const raced = await findExistingOrder(apiBase, supabaseKey, conflictKey);
      if (raced) {
        return createSuccessResponse(raced.id, buildLegacyOrderData(parsed), requestId);
      }
    }
    console.error(`[orders] insert failed request_id=${requestId} status=${insertResponse.status}`);
    return createErrorResponse('INTERNAL_ERROR', 'Order could not be created', 500, requestId);
  }

  const result = await insertResponse.json();
  const created = Array.isArray(result) ? result[0] : result;
  const orderId = created?.id || null;

  await sendTelegramOrderNotification(
    {
      customer_name: parsed.customer_name,
      phone: parsed.phone,
      services: orderData.services,
      total: orderData.total,
    },
    env
  );

  return createSuccessResponse(orderId, orderData, requestId);
}
