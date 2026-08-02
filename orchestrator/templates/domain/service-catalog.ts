export type ServiceDefinition = Readonly<{
  id: string;
  name: string;
  pricingMode: "fixed" | "contact";
  priceVnd: number | null;
  active: boolean;
  sortOrder: number;
  visualTarget?: "upper" | "sole" | "stitch" | "bag";
  category?: "cleaning" | "repair" | "protection";
  estimatedHours?: number;
  description?: string;
}>;

export const serviceCatalog: readonly ServiceDefinition[] = [
  {
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
  },
  {
    id: 'CLEAN_PREMIUM',
    name: 'Vệ sinh chuyên sâu & Khử khuẩn UV',
    pricingMode: 'fixed',
    priceVnd: 150000,
    active: true,
    sortOrder: 20,
    visualTarget: 'upper',
    category: 'cleaning',
    estimatedHours: 48,
    description: 'Vệ sinh chuyên sâu chất liệu cao cấp (da lộn, nubuck) kèm chiếu tia UV diệt khuẩn.',
  },
  {
    id: 'REPAIR_SOLE',
    name: 'Dán / Phục hồi đế giày',
    pricingMode: 'fixed',
    priceVnd: 200000,
    active: true,
    sortOrder: 30,
    visualTarget: 'sole',
    category: 'repair',
    estimatedHours: 72,
    description: 'Sửa chữa hở keo, khâu viền hoặc thay lót đế.',
  },
  {
    id: 'PROTECT_NANO',
    name: 'Phủ Nano chống nước & bụi',
    pricingMode: 'fixed',
    priceVnd: 80000,
    active: true,
    sortOrder: 40,
    visualTarget: 'upper',
    category: 'protection',
    estimatedHours: 12,
    description: 'Bảo vệ bề mặt giày khỏi ngấm nước và bám bẩn.',
  },
];
