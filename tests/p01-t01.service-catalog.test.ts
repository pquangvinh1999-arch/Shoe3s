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
  it('exports a service catalog synced with production DB (ADR-010/011)', () => {
    expect(serviceCatalog).toBeInstanceOf(Array);
    expect(serviceCatalog).toHaveLength(4);
    expect(serviceCatalog).toContainEqual({
      id: 'CLEAN_STANDARD',
      name: 'Giặt hấp & Vệ sinh tiêu chuẩn',
      pricingMode: 'fixed',
      priceVnd: 90000,
      active: true,
      sortOrder: 10,
      visualTarget: 'upper',
      category: 'cleaning',
      estimatedHours: 24,
      description: 'Vệ sinh bề mặt, đế giày và dây giày cho các loại sneaker thông thường.',
    });
  });

  it('looks up a service by name', () => {
    const svc = getServiceByName('Giặt hấp & Vệ sinh tiêu chuẩn');
    expect(svc).toEqual(expect.objectContaining({ id: 'CLEAN_STANDARD', priceVnd: 90000 }));
  });

  it('looks up a service by id', () => {
    const svc = getServiceById('CLEAN_PREMIUM');
    expect(svc).toEqual(expect.objectContaining({ name: 'Vệ sinh chuyên sâu & Khử khuẩn UV', priceVnd: 150000 }));
  });

  it('resolves selected names into service items and ids', () => {
    const items = resolveSelectedItems(['Giặt hấp & Vệ sinh tiêu chuẩn', 'Dán / Phục hồi đế giày']);
    expect(items).toEqual([
      { service_id: 'CLEAN_STANDARD', name: 'Giặt hấp & Vệ sinh tiêu chuẩn', priceVnd: 90000 },
      { service_id: 'REPAIR_SOLE', name: 'Dán / Phục hồi đế giày', priceVnd: 200000 },
    ]);
  });

  it('calculates total correctly', () => {
    const total = calculateTotal([
      { service_id: 'CLEAN_STANDARD', name: 'Giặt hấp & Vệ sinh tiêu chuẩn', priceVnd: 90000 },
      { service_id: 'CLEAN_PREMIUM', name: 'Vệ sinh chuyên sâu & Khử khuẩn UV', priceVnd: 150000 },
    ]);
    expect(total).toBe(240000);
  });

  it('generates a backward-compatible legacy services string', () => {
    expect(selectedNamesToLegacyServices(['Giặt hấp & Vệ sinh tiêu chuẩn', 'Dán / Phục hồi đế giày'])).toBe(
      'Giặt hấp & Vệ sinh tiêu chuẩn, Dán / Phục hồi đế giày',
    );
  });

  it('ignores invalid service names when resolving selected items', () => {
    const items = resolveSelectedItems(['Giặt hấp & Vệ sinh tiêu chuẩn', 'Không tồn tại']);
    expect(items).toEqual([
      { service_id: 'CLEAN_STANDARD', name: 'Giặt hấp & Vệ sinh tiêu chuẩn', priceVnd: 90000 },
    ]);
  });
});
