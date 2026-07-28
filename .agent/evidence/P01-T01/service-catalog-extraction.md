# P01-T01 Service Catalog Extraction

## Source
- Extracted from `js/app.js`.
- The booking flow uses a fixed object `pricingMap` and selected service names.
- The offline POS flow uses the same service names in `activePaymentServices`.
- This extraction is intended to support P01-T01 typed service/catalog modeling.

## Current service catalog
| Service ID | Name | Price (VND) | Notes |
|---|---|---|---|
| `service-cleaning` | Vệ sinh toàn diện | 69,000 | Core booking service |
| `service-glue-removal` | Xử lý keo | 139,000 | |
| `service-sole-stitch` | Khâu đế | 99,000 | |
| `service-sole-whitening` | Tẩy ố vàng đế | 139,000 | |
| `service-sole-taping` | Dán Sole | 0 | Zero-priced service in baseline |
| `service-sole-repair` | Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền | 0 | Zero-priced service in baseline |
| `service-bag-cleaning` | Vệ sinh túi sách, Balo | 0 | Marked as new service in code |

## Implementation notes
- `submitOrder()` computes total with:
  - `selectedServices.reduce((sum, s) => sum + (pricingMap[s.name] || 0), 0)`
- `orders.services` is stored as a comma-separated string from selected service names.
- `activePaymentServices` duplicates the same seven service names/prices for offline cash register logic.
- There is no explicit service ID in the baseline code, so P01-T01 should introduce stable IDs and centralize the catalog.

## Recommended P01-T01 next step
- Create a shared typed catalog with fields: `id`, `name`, `price`, `category`, `isFree`, `notes`.
- Replace duplicate `pricingMap` / `activePaymentServices` definitions with one canonical source of truth.
- Preserve current service strings for backwards compatibility during migration.
- See `orchestrator/templates/domain/service-catalog.example.ts` for the extracted typed catalog with stable IDs and fixed prices.
