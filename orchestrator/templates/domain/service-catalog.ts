export type ServiceDefinition = Readonly<{
  id: string;
  name: string;
  pricingMode: "fixed" | "contact";
  priceVnd: number | null;
  active: boolean;
  sortOrder: number;
  visualTarget?: "upper" | "sole" | "stitch" | "bag";
}>;

export const serviceCatalog: readonly ServiceDefinition[] = [
  {
    id: 'service-cleaning',
    name: 'Vệ sinh toàn diện',
    pricingMode: 'fixed',
    priceVnd: 69000,
    active: true,
    sortOrder: 10,
    visualTarget: 'upper',
  },
  {
    id: 'service-glue-removal',
    name: 'Xử lý keo',
    pricingMode: 'fixed',
    priceVnd: 139000,
    active: true,
    sortOrder: 20,
    visualTarget: 'sole',
  },
  {
    id: 'service-sole-stitch',
    name: 'Khâu đế',
    pricingMode: 'fixed',
    priceVnd: 99000,
    active: true,
    sortOrder: 30,
    visualTarget: 'stitch',
  },
  {
    id: 'service-sole-whitening',
    name: 'Tẩy ố vàng đế',
    pricingMode: 'fixed',
    priceVnd: 139000,
    active: true,
    sortOrder: 40,
    visualTarget: 'sole',
  },
  {
    id: 'service-sole-taping',
    name: 'Dán Sole',
    pricingMode: 'fixed',
    priceVnd: 0,
    active: true,
    sortOrder: 50,
    visualTarget: 'sole',
  },
  {
    id: 'service-sole-repair',
    name: 'Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền',
    pricingMode: 'fixed',
    priceVnd: 0,
    active: true,
    sortOrder: 60,
    visualTarget: 'sole',
  },
  {
    id: 'service-bag-cleaning',
    name: 'Vệ sinh túi sách, Balo',
    pricingMode: 'fixed',
    priceVnd: 0,
    active: true,
    sortOrder: 70,
    visualTarget: 'bag',
  },
];
