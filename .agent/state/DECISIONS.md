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

## ADR-011 — Catalog repo = production DB (4 services), sync kèm UI legacy

**Status:** accepted (2026-08-02, commit `c8f408a` — owner sync)
**Decision:** `js/service-catalog.js` chứa đúng 4 services production DB (CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K) — thay catalog 7 services legacy (giá cũ 69K/139K/99K/139K + 3 zero-priced "Liên hệ").
**Reason:** probe RLS (2026-08-03) xác nhận production DB chỉ có 4 services này; tránh lệch catalog UI/API/DB (R-008 context). Zero-priced services không nằm trong catalog chuẩn.
**Implication:** tất cả test + legacy UI (`index.html`) phải tham chiếu 4 services mới. P05-T01 remediation (2026-08-03) đã sync: P03-T01/P03-T03/P01-T02/P01-T01 tests + service cards legacy.
**Alternative:** giữ 7 services cũ và sync DB ngược — bỏ, vì DB production là nguồn giao dịch thật.

## ADR-010 — Xác nhận nguồn sự thật: Supabase project / catalog

**Status:** resolved (2026-08-03) — owner xác nhận: production project `vmakonkiotjkxlhpjwny`; **superseded bởi ADR-011** (catalog chuẩn = production DB 4 services, không phải 7 services repo cũ; repo đã sync theo DB). Rotation service key đã bị chia sẻ trong chat.
**Decision:**
1. **Project production = `vmakonkiotjkxlhpjwny`** (project service key đang trỏ, có bảng orders/services/order_items) — KHÔNG phải `agcvsogtqxoqlhcubghy` (anon key legacy debug trong `js/app.js`).
2. **Catalog chuẩn = repo `js/service-catalog.js` (7 services)** — DB (4 services) sẽ được đồng bộ/khớp theo repo khi RLS cutover (P03-T02).
3. Owner cung cấp policy export `supabase db dump --schema public` + anon key hợp lệ của project production để test anon path trước lockdown.
**Implication:** chờ 2 artifact trên để hoàn tất P03-T02; trước khi có, không bật RLS lockdown, giữ anonymous insert (canary tại API).
**Action:** owner paste output dump + anon key. Sau đó auditor verify anon path: check bảng services readable, orders insert qua /api/orders (service key) thành công.

## ADR-012 — Key rotation deferred to post-completion
**Status:** decided (2026-08-03, owner) — **giữ nguyên anon key (legacy + publishable) và service_role key đang dùng cho tới khi hoàn thành dự án**; rotate/thay đổi sau khi dự án xong.
**Impact:** legacy anon key đã lộ trong chat vẫn còn hiệu lực nhưng RLS lockdown đã giảm thiểu rủi ro (anon chỉ SELECT services public); service_role key đã lộ vẫn dùng cho booking API (bắt buộc cho functional). Bỏ requirement "owner revoke legacy anon key ngay" khỏi chặn Bước 12; hoãn sang task rotate sau completion.
