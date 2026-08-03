import { describe, expect, it } from 'vitest';
import { serviceCatalog, getPaymentServices } from '../js/service-catalog.js';

describe('P03-T03 POS service list derived from catalog', () => {
  it('derives payment services from the active catalog', () => {
    const services = getPaymentServices();
    expect(services).toHaveLength(serviceCatalog.filter((svc) => svc.active).length);
    expect(services[0]).toEqual({ n: 'Giặt hấp & Vệ sinh tiêu chuẩn', p: 90000, c: false });
  });

  it('preserves the names and prices used by POS', () => {
    const services = getPaymentServices();
    expect(services.map((s) => s.n)).toEqual([
      'Giặt hấp & Vệ sinh tiêu chuẩn',
      'Vệ sinh chuyên sâu & Khử khuẩn UV',
      'Dán / Phục hồi đế giày',
      'Phủ Nano chống nước & bụi',
    ]);
    expect(services.map((s) => s.p)).toEqual([90000, 150000, 200000, 80000]);
  });

  it('marks zero-priced services as custom price (c: true)', () => {
    const services = getPaymentServices();
    expect(services.filter((s) => s.c)).toEqual([]);
    expect(services.filter((s) => !s.c).every((s) => s.p > 0)).toBe(true);
  });

  it('keeps catalog sortOrder consistent with POS display order', () => {
    const activeOrder = serviceCatalog.filter((svc) => svc.active).map((svc) => svc.sortOrder);
    expect(activeOrder).toEqual([...activeOrder].sort((a, b) => a - b));
  });

  it('matches total when full POS selection is priced from catalog', () => {
    const services = getPaymentServices();
    const priced = services.filter((s) => !s.c);
    const total = priced.reduce((sum, s) => sum + s.p, 0);
    expect(total).toBe(520000);
  });
});
