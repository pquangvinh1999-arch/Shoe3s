# Independent Review #2 — Commit `9012984` (P03-T02 RLS Lockdown + Catalog Sync)

- Reviewer: independent second reviewer (model khác reviewer GPT-5.6) — roleplay reviewer kỹ thuật khắc nghiệt
- Commit: `9012984` `feat(P03-T02): apply RLS lockdown migration; fix catalog sync tests (ADR-011)`
- Parent: `c8f408a` · Reviewed: READ-ONLY (không sửa file, không chạy npm install/test)
- Date: 2026-08-03

## Phạm vi commit

| File | Nội dung |
|---|---|
| `supabase/migrations/20260803_rls_lockdown.sql` | MỚI — RLS lockdown services/orders/order_items trên production `vmakonkiotjkxlhpjwny` |
| `index.html` | Sync 4 service cards legacy theo catalog mới (ADR-011) |
| `tests/*` (5 files) | Sync catalog 4 services (prices 90K/150K/200K/80K, total 290K/520K) |
| `.agent/*` | Evidence P03-T02, STATE/CURRENT_TASK/DECISIONS/CHECKLIST/PLAN, SESSION_LOG |

Không có thay đổi code runtime (`functions/`, `js/`, `apps/web/`) trong commit này — mọi issue trên code đó là pre-existing, nhưng nằm trong module security mà commit tuyên bố hoàn tất ("R-008 closed", "lockdown applied").

## Tổng điểm: **63 / 100** → Kết luận: **REQUEST-CHANGES**

## Bảng chấm theo rubric

| Mục | Điểm | Nhận xét chính (file:line) |
|---|---|---|
| **Correctness** (20) | **12** | Catalog UI/POS/API/DB đã khớp (index.html:68-87 vs service-catalog.js:2-5, tests pass theo evidence). Nhưng: dashboard/POS client trỏ project legacy → đơn API không hiện trên admin (js/app.js:4); idempotency race chưa đóng (orders.js:175-202); insert contract chưa được verify E2E (rls-lockdown-applied.md:8 thiếu `service_ids`/`phone`/`total`; probe schema legacy rls-probe-anon.md:26); computeQuote items/total lệch (apps/web/src/features/booking/api.ts:39-46); replay bỏ so hash khi hash NULL (orders.js:177); service_ids trùng lặp không reject (js/order-schema.js:38-44) |
| **Security** (20) | **9** | Hướng lockdown đúng (anon revoked, service_role giữ nguyên, verify anon path 42501). Nhưng: **stored XSS admin qua customer_name** (js/app.js:294, 260-276, 287-299, 391-399); policy authenticated quá rộng `USING (true)` (migration:31-41); project legacy `agcvsogtqxoqlhcubghy` không được lockdown; Turnstile không có widget → hardcode `local-demo-token` (BookingWizard.tsx:54, index.html:98-101) → bypass/fail; /api/telegram không auth/rate-limit (functions/api/telegram.js:41-66) |
| **Performance** (15) | **12** | Bundle trong budget theo evidence (shell 61.61KB / 3D 131.44KB gzip ≤ 350KB); 3D adaptive quality tốt (scene.ts:10-25); rate limit in-memory per-isolate (orders.js:9,98-107) dễ bypass phân tán; `rateBuckets` Map không eviction |
| **Accessibility** (10) | **6** | React shell khá tốt (label, required, aria-live, minTouch 44px, reduced-motion). Legacy index.html kém: login/inputs không `<label>` (index.html:30-31, 53-57, 92-100), service cards div onclick không keyboard-accessible (index.html:68-87); wizard thiếu focus management giữa bước |
| **Maintainability** (15) | **11** | Migration gọn, có rollback ghi chú, evidence chi tiết; nhưng migration không self-contained (không `ENABLE ROW LEVEL SECURITY`, `CREATE POLICY` không idempotent — re-run fail); docs lệch (DECISIONS.md:43 "7 services" vs ADR-011 "4"); dead code (js/app.js:127-143 `sendTelegramNotification`, :73 `serviceByName`); inline `<style>` không scoped (BookingWizard.tsx:254-299, ShoeViewer.tsx:207-217) |
| **Tests** (10) | **7** | 70/70 (theo evidence), coverage API path tốt (validation/rate limit/idempotency replay/conflict/500-no-leak). Thiếu: test concurrency/race double-submit; không test XSS sink admin (customer_name có `"`); không test authenticated path (dashboard/POS/costs); p04-t02:23-29 không thực sự exercise filter zero-price (free=[]); test "skips bot check" (p03-t01:276-287) chính là mô tả bypass production |
| **Evidence** (10) | **6.5** | Probe anon path rất cụ thể (rls-probe-anon.md, rls-lockdown-applied.md: HTTP 200/401/42501). Nhưng: canary `POST /api/orders` (migration:59) chưa chạy — defer P08-T01; không verify authenticated path; anon key production paste trong evidence (rls-probe-anon.md:8) chưa rotate; evidence cũ nói "repo 7 services" lệch ADR-011 |

## Issues phân loại

### Critical — 1

**C1. Stored XSS trong admin panel qua `customer_name`** — `js/app.js:294` + `:260-276`, `:287-299`, `:391-399`, `:233-247`
- `updateBookings` chèn `customer_name` vào attribute `onclick="checkoutBooking('id', '${name.replace(/'/g, "\\'")}', ...)"` — chỉ escape `'`, KHÔNG escape `"`/`>` cho ngữ cảnh HTML attribute (double-quoted). `customer_name = x" onmouseover="alert(1)` → break-out attribute → XSS khi admin mở tab Đặt Lịch. Đồng thời `customer_name`/`phone`/`services` được nội suy thẳng vào `innerHTML` ở 4 sink khác.
- Vector: bất kỳ anon nào POST /api/orders với `customer_name` chứa `"` (js/order-schema.js:36 chỉ validate length 2-80, không sanitize) — không cần admin click.
- Impact: đọc `localStorage` → đánh cắp admin Supabase session → toàn quyền trên dữ liệu khách hàng (PII).
- Pre-existing (không do commit này thêm) nhưng commit tuyên bố hoàn tất module security; XSS chưa được test/chưa được ghi nhận rủi ro trong evidence.

### High — 5

**H1. Lockdown áp lên project KHÁC project mà client đang dùng** — `js/app.js:4-5` (`agcvsogtqxoqlhcubghy`, anon key legacy) vs migration `20260803_rls_lockdown.sql:2` (`vmakonkiotjkxlhpjwny`). ADR-010 (DECISIONS.md:42) xác nhận 2 project khác nhau. Hệ quả: (a) đơn đặt qua `/api/orders` (viết vào project production) không bao giờ hiển thị trên dashboard admin (đọc project legacy); (b) project legacy không bị lockdown → policy cũ (anon INSERT orders with_check true) vẫn còn nguyên → anon key public trong js/app.js vẫn insert thẳng được. Commit "lockdown production" nhưng bỏ sót data-plane thực tế của UI.

**H2. Turnstile không tồn tại trong UI public** — `index.html:98-101` chỉ là text input placeholder "Token tuỳ chọn"; `apps/web/src/features/booking/BookingWizard.tsx:54` hardcode `turnstile_token: 'local-demo-token'`. Với `verifyTurnstile` fail-closed (orders.js:61-88), mọi đơn production bị `BOT_CHECK_FAILED` — hoặc phải bật `ALLOW_TURNSTILE_SKIP=true` (orders.js:158) thì bot check bị tắt hoàn toàn. Không có trạng thái nào đúng cả: booking hỏng hoặc bảo vệ hỏng.

**H3. RLS policy `authenticated` quá rộng — mọi user authenticated đọc/sửa được toàn bộ orders** — `supabase/migrations/20260803_rls_lockdown.sql:31-41`: SELECT `USING (true)`, INSERT/UPDATE `WITH CHECK (true)` không phân biệt admin vs user thường. Nếu project bật signup (mặc định Supabase), attacker tự đăng ký → exfiltrate toàn bộ PII orders (tên, SĐT, địa chỉ) + sửa `total`/`status` mọi đơn. "authenticated = admin" là giả định, DB không đảm bảo.

**H4. Idempotency TOCTOU race chưa được đóng bằng DB constraint** — `functions/api/orders.js:175-202`: check-then-insert, không có unique index trên `orders.idempotency_key`. P03-T01 evidence (secure-order-api.md:38) lên kế hoạch `001_prepare_secure_booking.sql` + unique index — file không tồn tại, migration commit này cũng không thêm. Hai request cùng key đồng thời → 2 đơn trùng. R-008 closed không bao phủ race này.

**H5. Insert contract chưa verify E2E — API có thể 500 toàn bộ production** — rls-lockdown-applied.md:8 chỉ xác nhận `idempotency_key/idempotency_payload_hash/source/service_items/pricing_version`; KHÔNG xác nhận `service_ids`, `phone`, `total`, `services`, `status`, `pickup_address`, `note` (payload thực tế của insert, orders.js:185-191). Probe schema trước đó (rls-probe-anon.md:26) phát hiện schema legacy `phone_number`/`total_amount`/`user_id`. Canary trong verify plan (migration:59) chưa chạy (defer P08-T01). Lockdown "done" mà chưa chứng minh booking API chạy được trên schema thật.

### Medium — 6

**M1. `/api/telegram` mở tự do: không auth, không rate limit, không validate shape** — `functions/api/telegram.js:41-66`. Ai cũng POST spam vào Telegram chat của shop; fields không giới hạn độ dài → chi phí + spam.
**M2. Bảng `costs` (admin finance) nằm ngoài lockdown lẫn probe** — `js/app.js:201,206,350,356` đọc/ghi `costs`; baseline 5 policies không có costs (rls-lockdown-applied.md:9). RLS costs nếu không có policy cho authenticated → finance tab trả rỗng/42501. Verify sau lockdown chỉ test anon path, chưa test authenticated path nào.
**M3. Migration không self-contained** — không `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` (dựa hoàn toàn vào trạng thái dashboard, không tái lập được trên môi trường mới); `CREATE POLICY` không idempotent → re-run/rollback-reapply lỗi duplicate policy.
**M4. Rate limit per-isolate + fallback IP spoofable** — `orders.js:9,98-107`: Map trong bộ nhớ Worker isolate → attacker phân tán qua nhiều isolate/region bypass 20 req/min; `clientIpFromRequest` fallback `x-forwarded-for` (orders.js:90-96) client tự set khi không đi qua CF.
**M5. `computeQuote` items vs total không thống nhất** — `apps/web/src/features/booking/api.ts:39-46`: items filter `.active`, total không filter. Catalog hiện tại không có service inactive/zero-price nên không bộc lộ, nhưng là latent bug; test p04-t02:23-29 không detect vì `free = []` hiện tại.
**M6. XSS trong print window** — `js/app.js:706-758`: `printWindow.document.write` chèn `name`/`phone` chưa escape; `name` xuất phát từ `customer_name` landing (qua checkoutBooking → pay-name) → admin bấm in hóa đơn → script chạy trong window about:blank có thể truy cập `opener`.

### Low — 8

**L1.** `service_ids` trùng lặp không bị reject — `js/order-schema.js:38-44` → quote nhân đôi giá (giới hạn 10 items). 
**L2.** Replay chỉ so hash khi hash tồn tại (`orders.js:177`) — row legacy hash NULL → replay lỏng cho payload khác.
**L3.** Anon key production dán trong evidence (`rls-probe-anon.md:8`) + rotation chưa làm (CURRENT_TASK.md: "Rotate anon key production ... trước Bước 12/13") — chưa phải leak (anon key thiết kế public) nhưng cần rotate theo ADR-010.
**L4.** Dead code `js/app.js:127-143` (`sendTelegramNotification` không dùng), `:73` (`serviceByName`), các window export không dùng; docs lệch ADR-010 "7 services" (DECISIONS.md:43) vs ADR-011 "4".
**L5.** Inline `<style>` trong React component không scoped — class `.muted/.small/.cta/.service-card` collision giữa BookingWizard/BookingPage/styles.css.
**L6.** A11y legacy: inputs không `<label>` (index.html:30-31, 53-57), service card là `div onclick` không phải button (index.html:68-87), không keyboard-focusable.
**L7.** `rateBuckets` Map không eviction (orders.js:9) — memory tăng theo số IP khác nhau.
**L8.** Test "skips bot check when ALLOW_TURNSTILE_SKIP" (tests/p03-t01:276-287) mô tả chính xác đường bypass nếu flag bật ở production; không có gate chặn flag này khi deploy.

## Điểm mạnh (đáng ghi nhận)

- Hướng RLS đúng: anon revoked toàn bộ trên orders/order_items, services public read-only `is_active=true`, DELETE không cấp cho authenticated — bộ chặn chính xác cho mô hình "API service_role là cửa ghi duy nhất" (orders.js:167).
- Verify anon path rất cụ thể (HTTP 200/401/42501 có evidence) — không phải claim suông.
- Sync catalog 4 services đồng bộ UI legacy (index.html), POS (getPaymentServices), API (order-schema), tests — không còn sót tên/giá cũ (69K/139K/99K... đã xoá sạch khỏi UI).
- Giá luôn do server tính từ catalog (buildLegacyOrderData) — client không đẩy giá được.
- Telegram HTML escape đầy đủ 5 ký tự + fail-closed khi thiếu secret.

## Kết luận

**REQUEST-CHANGES** (63/100). Commit này tự nó (migration RLS + sync catalog + evidence) có chất lượng khá, nhưng không thể "close R-008 / P03-T02 lockdown" trong khi còn nguyên:

1. **C1** — stored XSS admin (nguồn: anon visitor) chưa fix, chưa test;
2. **H1** — client admin/POS vẫn chạy trên project KHÔNG được lockdown (`agcvsogtqxoqlhcubghy`) — lockdown mới chỉ bảo vệ một nửa hệ thống;
3. **H2/H4/H5** — booking API chưa có canary E2E trên schema production, idempotency race chưa có unique index, Turnstile thực tế không tồn tại trong UI (hoặc bị bypass bằng env flag).

Điều kiện để approve: fix C1 (escape attribute + text, hoặc chuyển admin sang React/Anti-XSS), lockdown đồng bộ project client hoặc chuyển client sang project production, thêm unique index `idempotency_key` + test concurrency, chạy canary `POST /api/orders` thật trên production (migration:59), thu hẹp policy authenticated (hoặc tắt signup + chứng minh chỉ 1 admin account).
