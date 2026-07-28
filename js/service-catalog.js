const serviceCatalog = [
  { id: 'service-cleaning', name: 'Vệ sinh toàn diện', pricingMode: 'fixed', priceVnd: 69000, active: true, sortOrder: 10, visualTarget: 'upper' },
  { id: 'service-glue-removal', name: 'Xử lý keo', pricingMode: 'fixed', priceVnd: 139000, active: true, sortOrder: 20, visualTarget: 'sole' },
  { id: 'service-sole-stitch', name: 'Khâu đế', pricingMode: 'fixed', priceVnd: 99000, active: true, sortOrder: 30, visualTarget: 'stitch' },
  { id: 'service-sole-whitening', name: 'Tẩy ố vàng đế', pricingMode: 'fixed', priceVnd: 139000, active: true, sortOrder: 40, visualTarget: 'sole' },
  { id: 'service-sole-taping', name: 'Dán Sole', pricingMode: 'fixed', priceVnd: 0, active: true, sortOrder: 50, visualTarget: 'sole' },
  { id: 'service-sole-repair', name: 'Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền', pricingMode: 'fixed', priceVnd: 0, active: true, sortOrder: 60, visualTarget: 'sole' },
  { id: 'service-bag-cleaning', name: 'Vệ sinh túi sách, Balo', pricingMode: 'fixed', priceVnd: 0, active: true, sortOrder: 70, visualTarget: 'bag' },
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

if (typeof window !== 'undefined') {
  window.serviceCatalog = serviceCatalog;
  window.getServiceCatalog = getServiceCatalog;
  window.getServiceByName = getServiceByName;
  window.getServiceById = getServiceById;
  window.resolveSelectedItems = resolveSelectedItems;
  window.calculateTotal = calculateTotal;
  window.selectedNamesToLegacyServices = selectedNamesToLegacyServices;
}

export {
  serviceCatalog,
  getServiceCatalog,
  getServiceByName,
  getServiceById,
  resolveSelectedItems,
  calculateTotal,
  selectedNamesToLegacyServices,
};
