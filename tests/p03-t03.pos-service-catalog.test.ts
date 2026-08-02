import { describe, expect, it } from 'vitest';
import { serviceCatalog, getPaymentServices } from '../js/service-catalog.js';

describe('P03-T03 POS service list derived from catalog', () => {
  it('derives payment services from the active catalog', () => {
    const services = getPaymentServices();
    expect(services).toHaveLength(serviceCatalog.filter((svc) => svc.active).length);
    expect(services[0]).toEqual({ n: 'Vệ sinh toàn diện', p: 69000, c: false });
  });

  it('preserves the legacy names and prices used by POS', () => {
    const services = getPaymentServices();
    expect(services.map((s) => s.n)).toEqual([
      'Vệ sinh toàn diện',
      'Xử lý keo',
      'Khâu đế',
      'Tẩy ố vàng đế',
      'Dán Sole',
      'Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền',
      'Vệ sinh túi sách, Balo',
    ]);
    expect(services.map((s) => s.p)).toEqual([69000, 139000, 99000, 139000, 0, 0, 0]);
  });

  it('marks zero-priced services as custom price (c: true)', () => {
    const services = getPaymentServices();
    expect(services.filter((s) => s.c)).toEqual([
      { n: 'Dán Sole', p: 0, c: true },
      { n: 'Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền', p: 0, c: true },
      { n: 'Vệ sinh túi sách, Balo', p: 0, c: true },
    ]);
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
    expect(total).toBe(446000);
  });
});
