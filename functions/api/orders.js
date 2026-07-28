import { orderRequestSchema, buildLegacyOrderData } from '../../js/order-schema.js';

const RESPONSE_HEADERS = {
  'Content-Type': 'application/json',
};

function createErrorResponse(code, message, status = 400) {
  return new Response(JSON.stringify({ ok: false, code, message, request_id: crypto.randomUUID() }), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return createErrorResponse('INVALID_METHOD', 'Only POST is allowed', 405);
  }

  let payload;
  try {
    payload = await request.json();
  } catch (err) {
    return createErrorResponse('VALIDATION_ERROR', 'Request body must be valid JSON', 400);
  }

  let parsed;
  try {
    parsed = orderRequestSchema.parse(payload);
  } catch (err) {
    return createErrorResponse('VALIDATION_ERROR', err.message || 'Request validation failed', 400);
  }

  const orderData = buildLegacyOrderData(parsed);
  const insertPayload = {
    ...orderData,
    pricing_version: 'catalog-v1',
    source: 'web-3d-booking',
    idempotency_key: parsed.idempotency_key,
  };

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return createErrorResponse('INTERNAL_ERROR', 'Supabase server-side configuration is missing', 500);
  }

  const insertUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/orders`;

  const response = await fetch(insertUrl, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify([insertPayload]),
  });

  if (!response.ok) {
    const text = await response.text();
    return createErrorResponse('INTERNAL_ERROR', `Supabase insert failed: ${text}`, 500);
  }

  const result = await response.json();
  const created = Array.isArray(result) ? result[0] : result;
  const orderId = created?.id || null;

  return new Response(JSON.stringify({
    ok: true,
    order_id: orderId,
    status: orderData.status,
    quote: {
      total_vnd: orderData.total,
      items: orderData.service_items.map((item) => ({
        service_id: item.service_id,
        name: item.name,
        qty: item.qty,
        unit_price_vnd: item.unit_price_vnd,
      })),
    },
  }), {
    status: 200,
    headers: RESPONSE_HEADERS,
  });
}
