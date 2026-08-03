const serviceCatalog = [
  { id: 'CLEAN_STANDARD', name: 'Giặt hấp & Vệ sinh tiêu chuẩn', pricingMode: 'fixed', priceVnd: 90000, active: true, sortOrder: 10, visualTarget: 'upper', category: 'cleaning', estimatedHours: 24, description: 'Vệ sinh bề mặt, đế giày và dây giày cho các loại sneaker thông thường.' },
  { id: 'CLEAN_PREMIUM', name: 'Vệ sinh chuyên sâu & Khử khuẩn UV', pricingMode: 'fixed', priceVnd: 150000, active: true, sortOrder: 20, visualTarget: 'upper', category: 'cleaning', estimatedHours: 48, description: 'Vệ sinh chuyên sâu chất liệu cao cấp (da lộn, nubuck) kèm chiếu tia UV diệt khuẩn.' },
  { id: 'REPAIR_SOLE', name: 'Dán / Phục hồi đế giày', pricingMode: 'fixed', priceVnd: 200000, active: true, sortOrder: 30, visualTarget: 'sole', category: 'repair', estimatedHours: 72, description: 'Sửa chữa hở keo, khâu viền hoặc thay lót đế.' },
  { id: 'PROTECT_NANO', name: 'Phủ Nano chống nước & bụi', pricingMode: 'fixed', priceVnd: 80000, active: true, sortOrder: 40, visualTarget: 'upper', category: 'protection', estimatedHours: 12, description: 'Bảo vệ bề mặt giày khỏi ngấm nước và bám bẩn.' },
];

const serviceByName = Object.fromEntries(serviceCatalog.map((svc) => [svc.name, svc]));
const serviceById = Object.fromEntries(serviceCatalog.map((svc) => [svc.id, svc]));

function getServiceCatalog() {
  return serviceCatalog;
}

function getServiceByName(name) {
  return serviceByName[name] || null;
}

function getServiceById(id) {
  return serviceById[id] || null;
}

function resolveSelectedItems(selectedNames = []) {
  return selectedNames
    .map((name) => getServiceByName(name))
    .filter((svc) => svc !== null)
    .map((svc) => ({
      service_id: svc.id,
      name: svc.name,
      priceVnd: svc.priceVnd ?? 0,
    }));
}

function calculateTotal(items = []) {
  return items.reduce((sum, item) => sum + (item.priceVnd || 0), 0);
}

function selectedNamesToLegacyServices(selectedNames = []) {
  return selectedNames
    .map((name) => getServiceByName(name)?.name || name)
    .join(', ');
}

function getPaymentServices() {
  return serviceCatalog
    .filter((svc) => svc.active)
    .map((svc) => ({
      n: svc.name,
      p: svc.priceVnd ?? 0,
      c: svc.priceVnd === 0,
    }));
}

if (typeof window !== 'undefined') {
  window.serviceCatalog = serviceCatalog;
  window.getServiceCatalog = getServiceCatalog;
  window.getServiceByName = getServiceByName;
  window.getServiceById = getServiceById;
  window.resolveSelectedItems = resolveSelectedItems;
  window.calculateTotal = calculateTotal;
  window.selectedNamesToLegacyServices = selectedNamesToLegacyServices;
  window.getPaymentServices = getPaymentServices;
}

export {
  serviceCatalog,
  getServiceCatalog,
  getServiceByName,
  getServiceById,
  resolveSelectedItems,
  calculateTotal,
  selectedNamesToLegacyServices,
  getPaymentServices,
};
