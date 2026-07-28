# P01-T01 Code Path and Unit Test Plan

## Current P01-T01 implementation state
- `js/app.js` now contains a typed `serviceCatalog` array with stable IDs and fixed prices.
- `toggleSvc()` stores selected services by name and ID.
- `submitOrder()` converts selected items to `service_ids` and computes total from catalog values.
- Legacy `services` string is still preserved for backward compatibility.

## Target P01-T01 code path

### 1. Central service catalog source
- `orchestrator/templates/domain/service-catalog.ts`
  - define `ServiceDefinition`
  - export `serviceCatalog`
- This catalog becomes the single source of truth for pricing and label data.

### 2. Lookup helpers
- In the front-end, implement helpers:
  - `getServiceByName(name: string): ServiceDefinition | undefined`
  - `getServiceById(id: string): ServiceDefinition | undefined`
  - `getSelectedItems(selectedServices): SelectedItem[]`
  - `calculateTotal(selectedItems): number`

### 3. Order payload preparation
- In `submitOrder()`:
  - map selected names to catalog entries
  - collect `service_ids`
  - compute `total` from `priceVnd`
  - keep `services` legacy string for compatibility
- The resulting payload should contain:
  - `customer_name`
  - `phone`
  - `services`
  - `service_ids`
  - `total`
  - `status`
  - `created_at`

### 4. Compatibility retention
- Keep existing display and admin flows working with the legacy `services` string.
- Make catalog IDs internal for the new ordering path.
- Do not change persisted status text values in baseline behavior.

## Concrete P01-T01 implementation tasks
1. Move `serviceCatalog` definition to a shared module/file.
2. Replace duplicate `pricingMap` + duplicated `activePaymentServices` definitions with catalog-driven logic.
3. Add lookup helpers for `serviceByName` and `serviceById`.
4. In submit flow, derive `service_ids` from catalog IDs.
5. Keep legacy `services` as a display field only.
6. Optionally, update any payment/receipt summary to use catalog prices rather than hard-coded maps.

## Unit test plan

### Test targets
- `serviceCatalog` contents
- `getServiceByName()` and `getServiceById()` lookups
- `calculateTotal()` from selected catalog items
- `selectedServices` → `selectedItems` mapping
- backward-compatible legacy `services` string generation

### Example test cases
- `serviceCatalog` includes exactly 7 service entries with expected IDs and prices.
- `getServiceByName('Vệ sinh toàn diện')` returns ID `service-cleaning` and price `69000`.
- `getServiceById('service-sole-stitch')` returns name `Khâu đế`.
- `calculateTotal([{ priceVnd: 69000 }, { priceVnd: 139000 }])` returns `208000`.
- `selectedServices` with `[ { name: 'Vệ sinh toàn diện', id: 'service-cleaning' } ]` maps to `service_ids: ['service-cleaning']`.
- legacy string generation preserves text labels: `'Vệ sinh toàn diện, Khâu đế'`.
- invalid service name is ignored or rejected by helper and does not contribute to total.

### Recommended test file location
- `tests/p01-t01.service-catalog.test.ts`
- Use Vitest or another unit test runner when package manifest exists.

### Implementation note for tests
- Keep tests isolated from Supabase or backend.
- Focus on catalog data consistency and order payload construction.
- Validate that new catalog-based flow produces identical order totals to the legacy pricing map.
