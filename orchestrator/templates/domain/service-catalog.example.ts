export type ServiceDefinition = Readonly<{
  id: string;
  name: string;
  pricingMode: "fixed" | "contact";
  priceVnd: number | null;
  active: boolean;
  sortOrder: number;
  visualTarget?: "upper" | "sole" | "stitch" | "bag";
}>;

// Replace/verify values by extracting the current production code.
// This file is a shape example, not an authoritative production catalog.
export const serviceCatalog: readonly ServiceDefinition[] = [];
