# P01-T01 + P01-T02 Migration Plan

## Objective
Chuẩn hoá service catalog và order schema, đồng thời giữ tương thích với behavior hiện tại trước khi kết nối backend mới.

## Phase 1: Typed Catalog (`P01-T01`)

### 1. Extract current catalog
- Từ `js/app.js`, xác định rõ service names, prices, active flags.
- Hiện có 7 dịch vụ:
  - `Vệ sinh toàn diện` — 69,000
  - `Xử lý keo` — 139,000
  - `Khâu đế` — 99,000
  - `Tẩy ố vàng đế` — 139,000
  - `Dán Sole` — 0
  - `Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền` — 0
  - `Vệ sinh túi sách, Balo` — 0

### 2. Tạo shared typed catalog
- File mẫu: `orchestrator/templates/domain/service-catalog.ts`
- Schema:
  - `id: string`
  - `name: string`
  - `pricingMode: "fixed" | "contact"`
  - `priceVnd: number | null`
  - `active: boolean`
  - `sortOrder: number`
  - `visualTarget?: "upper" | "sole" | "stitch" | "bag"`

### 3. Bổ sung implementation
- Xây thêm catalog adapter trong client side (đã tạo tại `js/app.js`).
- Đảm bảo mọi logic tính toán giá dùng catalog chứ không dùng map cứng.
- Giữ lại legacy string `services` để tương thích hiện tại.

### 4. Verify
- Unit test xác thực mỗi service có giá và ID đúng.
- Test rằng cùng selection trả kết quả total giống trước.

## Phase 2: Order schema + compatibility adapter (`P01-T02`)

### 1. Định nghĩa schema request/domain
- Dựa trên `docs/orchestrator/04_DATA_API_CONTRACTS.md`.
- Request nên chứa:
  - `customer_name: string`
  - `phone: string`
  - `service_ids: string[]`
  - `pickup_address?: string`
  - `note?: string`
  - `turnstile_token: string`
  - `idempotency_key: string`

### 2. Viết adapters
- `service_ids` → `service_items` / legacy `services`
- `legacy services string` → `service_ids`
- Adapter phải giữ tương thích với giá trị hiện có:
  - cùng label
  - cùng total
  - cùng status text

### 3. Status constants
- Định nghĩa internal constants, nhưng không đổi giá trị persisted hiện tại:
  - `NEW_ORDER_STATUS = 'Chờ thanh toán'`
  - `LEGACY_ORDER_STATUS = 'Chờ nhận đơn'`
  - `COMPLETED_ORDER_STATUS = 'Đã hoàn thành'`

### 4. Verify
- Unit tests cho:
  - request schema validation
  - `service_ids` ↔ legacy `services` round-trip
  - total/tax/price logic khi dùng catalog
  - invalid service ID/reject malformed input

## Migration steps
1. Hoàn thiện `P01-T01` catalog typed, có ID.
2. Giữ code cũ hoạt động bằng legacy string, nhưng dùng catalog làm tham chiếu tính giá.
3. Thêm adapter và schema ở layer form/submit.
4. Test front-end flow với catalog mới, trước khi kết nối API.
5. Sau khi `P01-T02` ổn, chuyển sang `P02-T01` để xây API server-side.

## Dependencies
- `P00-T02` baseline behavior đã hoàn thành.
- `P00-T03` audit đủ evidence hoặc ít nhất xác định rõ rủi ro và policy gap.

## Outputs
- `orchestrator/templates/domain/service-catalog.ts`
- `js/app.js` client-side catalog adapter
- `js/order-schema.js` request schema + legacy adapter module
- `P01-T01` evidence file: typed catalog extraction
- `P01-T02` evidence file: schema/adapters and compatibility tests
- `.agent/evidence/P01-T01-p01-T02/p01-t02-schema-adapters.md`
