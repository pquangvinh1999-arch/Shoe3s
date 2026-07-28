import { z } from 'zod';
import { getServiceById, getServiceByName } from './service-catalog.js';

const VN_PHONE_PATTERN = /^84\d{9}$/;

export const ORDER_STATUS = {
  NEW: 'Chờ thanh toán',
  LEGACY_NEW: 'Chờ nhận đơn',
  COMPLETED: 'Đã hoàn thành',
};

export function normalizeVietnamPhone(value = '') {
  const raw = String(value).trim();
  const digits = raw.replace(/[^0-9]/g, '');

  if (digits.length === 10 && digits.startsWith('0')) {
    return '84' + digits.slice(1);
  }

  if (digits.length === 11 && digits.startsWith('84')) {
    return digits;
  }

  return digits;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizeVietnamPhone)
  .refine((value) => VN_PHONE_PATTERN.test(value), {
    message: 'Phone must be a normalized Vietnamese phone number',
  });

export const orderRequestSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  service_ids: z
    .array(z.string().trim())
    .min(1)
    .max(10)
    .refine((ids) => ids.every((id) => Boolean(getServiceById(id))), {
      message: 'service_ids must reference existing catalog services',
    }),
  pickup_address: z.string().trim().max(240).optional(),
  note: z.string().trim().max(500).optional(),
  turnstile_token: z.string().trim().min(1),
  idempotency_key: z.string().uuid(),
});

const LEGACY_SERVICE_ITEM_RE = /^\s*(.+?)(?:\s*\(x(\d+)\))?\s*$/;

export function parseLegacyServiceItem(raw = '') {
  const match = String(raw).trim().match(LEGACY_SERVICE_ITEM_RE);
  if (!match) return null;

  const [, name, qtyText] = match;
  const qty = qtyText ? Number(qtyText) : 1;
  const service = getServiceByName(name.trim());
  if (!service) return null;

  return {
    service_id: service.id,
    name: service.name,
    qty,
    priceVnd: service.priceVnd,
    subtotal: (service.priceVnd ?? 0) * qty,
  };
}

export function legacyServicesToStructuredItems(servicesString = '') {
  return String(servicesString)
    .split(',')
    .map((raw) => parseLegacyServiceItem(raw))
    .filter((item) => item !== null);
}

export function legacyServicesToServiceIds(servicesString = '') {
  return legacyServicesToStructuredItems(servicesString).map((item) => item.service_id);
}

export function serviceIdsToStructuredItems(serviceIds = []) {
  return Array.from(serviceIds)
    .map((id) => getServiceById(id))
    .filter((service) => service !== null)
    .map((service) => ({
      service_id: service.id,
      name: service.name,
      qty: 1,
      priceVnd: service.priceVnd,
      subtotal: (service.priceVnd ?? 0) * 1,
    }));
}

export function serviceIdsToLegacyServices(serviceIds = []) {
  return serviceIds
    .map((id) => getServiceById(id))
    .filter((service) => service !== null)
    .map((service) => service.name)
    .join(', ');
}

export function serviceIdsToLegacyItems(serviceIds = []) {
  return serviceIdsToStructuredItems(serviceIds).map((item) => ({
    service_id: item.service_id,
    name: item.name,
    qty: item.qty,
    unit_price_vnd: item.priceVnd,
  }));
}

export function calculateStructuredItemsTotal(items = []) {
  return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
}

export function buildLegacyOrderData(request) {
  const parsed = orderRequestSchema.parse(request);
  const items = serviceIdsToStructuredItems(parsed.service_ids);
  return {
    customer_name: parsed.customer_name,
    phone: parsed.phone,
    pickup_address: parsed.pickup_address,
    note: parsed.note,
    services: serviceIdsToLegacyServices(parsed.service_ids),
    service_ids: parsed.service_ids,
    service_items: serviceIdsToLegacyItems(parsed.service_ids),
    total: calculateStructuredItemsTotal(items),
    status: ORDER_STATUS.NEW,
    created_at: new Date().toISOString(),
  };
}

if (typeof window !== 'undefined') {
  window.orderRequestSchema = orderRequestSchema;
  window.normalizeVietnamPhone = normalizeVietnamPhone;
  window.legacyServicesToServiceIds = legacyServicesToServiceIds;
  window.serviceIdsToLegacyServices = serviceIdsToLegacyServices;
  window.buildLegacyOrderData = buildLegacyOrderData;
}
