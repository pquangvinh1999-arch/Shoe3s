export type Service = {
  id: string;
  name: string;
  description?: string;
  pricingMode: 'fixed' | 'contact';
  priceVnd: number | null;
  active: boolean;
  sortOrder: number;
  visualTarget?: 'upper' | 'sole' | 'stitch' | 'bag';
  category?: 'cleaning' | 'repair' | 'protection';
  estimatedHours?: number;
};

export type ResolvedServiceItem = {
  service_id: string;
  name: string;
  priceVnd: number;
};

export type PaymentServiceItem = {
  n: string;
  p: number;
  c: boolean;
};

export function getServiceCatalog(): Service[];
export function getServiceByName(name: string): Service | null;
export function getServiceById(id: string): Service | null;
export function resolveSelectedItems(selectedNames?: string[]): ResolvedServiceItem[];
export function calculateTotal(items?: ResolvedServiceItem[]): number;
export function selectedNamesToLegacyServices(selectedNames?: string[]): string;
export function getPaymentServices(): PaymentServiceItem[];
export const serviceCatalog: Service[];
