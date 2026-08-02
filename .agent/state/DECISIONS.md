# Architecture Decision Log

Use one ADR entry per approved architecture or behavior change.

## ADR-007 — React/Vite/TypeScript shell (P04-T01 spike)

**Status:** accepted (2026-08-02, sau spike P04-T01)
**Decision:** React + Vite + TypeScript cho shell public booking; giữ legacy static làm production path cho tới cutover (ADR-001).
**Reason:** code-splitting rõ ràng (booking shell tách admin/3D), React text rendering chống XSS (R-002), tương thích Cloudflare Pages build.
**Dependencies added:** `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom` (đều MIT).
**Bundle cost:** public shell ≤ 180KB gzip budget (docs/05); admin/3D là lazy chunk riêng, không vào booking initial.
**Alternative:** Vanilla TS modular — fallback nếu build/deploy constraints không đạt (không dùng).
**Fallback:** giữ legacy static + feature flag `BOOKING_3D_ENABLED` (docs/06).

## ADR-008 — Lightweight route adapter không dùng react-router

**Status:** accepted (2026-08-02)
**Decision:** adapter nhỏ tự parse `?page=order` và `/booking/` thay vì react-router.
**Reason:** chỉ 2–3 route; giảm dependency + bundle; không cần SSR/nested routes.
**Alternative:** react-router-dom — thêm khi số route tăng và cần nested/lazy layout.


## ADR-009 — Procedural 3D model thay vì licensed GLB

**Status:** accepted (2026-08-02)
**Decision:** dựng giày 3D bằng three.js primitives (box/sphere/cylinder) + dirt texture canvas; không chờ asset GLB.
**Reason:** R-009 — chưa có model giày có license; procedural loại bỏ rủi ro license, tự chủ hoàn toàn, chunk gzip 130.6KB (≤350KB budget). Dirty-to-clean qua material lerp + noise texture.
**Alternative:** licensed GLB — thay được phần `buildProceduralShoe()` khi có asset hợp lệ; giữ nguyên wrapper ShoeViewer/API.

## ADR-010 — Xung đột nguồn sự thật: Supabase project / catalog (recorded, chưa chọn)

**Status:** recorded — cần owner xác nhận (2026-08-02)
**Conflict (theo CONTEXT.md, phải ghi nhận không tự chọn):**
1. Anon key trong `js/app.js` trỏ project `agcvsogtqxoqlhcubghy` — project tồn tại nhưng không expose bảng `public.services` (404 PGRST205), không khớp schema booking.
2. Service key owner cấp trỏ project `vmakonkiotjkxlhpjwny` — có 3 bảng (orders/services/order_items), schema **legacy**: `orders(phone_number, total_amount, ...)` KHÔNG có `idempotency_key`/`source`; 4 services: CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K.
3. Catalog repo `js/service-catalog.js`: 7 services `service-cleaning` 69K, `service-glue-removal` 139K, `service-sole-stitch` 99K, `service-sole-whitening` 139K, 3 món giá 0 — khác hẳn 4 services DB.
**Implication:** chưa thể xác định project production thật + RLS state (thiếu anon key hợp lệ của project production để test anon path; service key bypass RLS nên không chứng minh được RLS trạng thái gì).
**Action:** owner cần xác nhận (a) project production nào, (b) anon key của project đó, (c) catalog nào là chuẩn (DB hay repo) trước khi P03-T02 RLS cutover. Đồng thời rotate service key đã chia sẻ trong chat.
