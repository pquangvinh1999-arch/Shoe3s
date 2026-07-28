# P01-T02 Schema and Compatibility Adapters

## Objective
- Document the order request schema and adapter layer introduced for `P01-T02`.
- Capture the compatibility strategy for legacy admin and new structured order payloads.

## Implementation
- Added `js/order-schema.js` with shared request schema and compatibility adapter helpers.
- The new schema validates:
  - `customer_name` (2..80 chars)
  - `phone` (normalized Vietnamese phone number)
  - `service_ids` (existing catalog service IDs)
  - `pickup_address` (optional)
  - `note` (optional)
  - `turnstile_token` (required string)
  - `idempotency_key` (UUID)
- Added `buildLegacyOrderData()` to derive persisted legacy order fields:
  - `services` legacy string
  - `service_ids` structured IDs
  - `total` from catalog prices
  - `status = 'Chờ thanh toán'`
  - `created_at`

## Verification
- Added unit tests in `tests/p01-T02.order-schema.test.ts` covering:
  - phone normalization
  - request schema validation
  - invalid service ID rejection
  - legacy services round-trip
  - total calculation and legacy-compatible order object
- Updated frontend checkout flow to use `buildLegacyOrderData()` in `js/app.js`.
- Updated E2E test expectations to account for normalized phone payloads.
