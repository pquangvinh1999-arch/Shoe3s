import { describe, expect, it } from 'vitest';
import {
  serviceCatalog,
  getServiceByName,
  getServiceById,
  resolveSelectedItems,
  calculateTotal,
  selectedNamesToLegacyServices,
} from '../js/service-catalog.js';

describe('P01-T01 service catalog adapter', () => {
  it('exports a service catalog with stable ids and prices', () => {
    expect(serviceCatalog).toBeInstanceOf(Array);
    expect(serviceCatalog.length).toBeGreaterThanOrEqual(7);
    expect(serviceCatalog).toContainEqual({
      id: 'service-cleaning',
      name: 'Vệ sinh toàn diện',
      pricingMode: 'fixed',
      priceVnd: 69000,
      active: true,
      sortOrder: 10,
      visualTarget: 'upper',
    });
  });

  it('looks up a service by name', () => {
    const svc = getServiceByName('Vệ sinh toàn diện');
    expect(svc).toEqual(expect.objectContaining({ id: 'service-cleaning', priceVnd: 69000 }));
  });

  it('looks up a service by id', () => {
    const svc = getServiceById('service-sole-stitch');
    expect(svc).toEqual(expect.objectContaining({ name: 'Khâu đế', priceVnd: 99000 }));
  });

  it('resolves selected names into service items and ids', () => {
    const items = resolveSelectedItems(['Vệ sinh toàn diện', 'Khâu đế']);
    expect(items).toEqual([
      { service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', priceVnd: 69000 },
      { service_id: 'service-sole-stitch', name: 'Khâu đế', priceVnd: 99000 },
    ]);
  });

  it('calculates total correctly', () => {
    const total = calculateTotal([
      { service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', priceVnd: 69000 },
      { service_id: 'service-sole-stitch', name: 'Khâu đế', priceVnd: 99000 },
    ]);
    expect(total).toBe(168000);
  });

  it('generates a backward-compatible legacy services string', () => {
    expect(selectedNamesToLegacyServices(['Vệ sinh toàn diện', 'Khâu đế'])).toBe('Vệ sinh toàn diện, Khâu đế');
  });

  it('ignores invalid service names when resolving selected items', () => {
    const items = resolveSelectedItems(['Vệ sinh toàn diện', 'Không tồn tại']);
    expect(items).toEqual([{ service_id: 'service-cleaning', name: 'Vệ sinh toàn diện', priceVnd: 69000 }]);
  });
});
