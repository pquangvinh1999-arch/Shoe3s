# Session Log

Append compact checkpoints only; do not paste full chat transcripts.

## 2026-08-02 — Context gate approved (P00-T03 done)
- Reviewed AGENTS.md, MASTER_CONTEXT.md, STATE.json, PLAN.json, CHECKLIST.md, all P00-T03/P00-T04 evidence.
- Filled `.agent/state/CONTEXT_REVIEW.md` (status approved) with findings: missing RLS policy export, no `/api/orders`, XSS in telegram/admin innerHTML, missing assets + unpinned CDN, duplicate pricing map, P00-T04 unregistered in PLAN.json.
- STATE.json: `context_gate → approved`; `active_task → P01-T01` (research); phase `research`; research_gate pending.
- PLAN.json: P00-T03 → done; P00-T04 registered (todo); P01-T01 → active.
- CHECKLIST.md: Bước 2 done; Bước 3 (research) in progress.
- RISKS.md: R-006 → Mitigated; R-007 updated (policy export pending).

## 2026-08-02 — Research + planning complete (P01-T01, P02-T01 done)
- Read all docs/orchestrator/ (00-08), full js/app.js, index.html, service-catalog.js, order-schema.js, orders.js, telegram.js.
- KEY FINDING: baseline import (0a862ff) đã scaffold P01/P02 — typed catalog, Zod schema, adapters, /api/orders scaffold; `pricingMap` không còn tồn tại (evidence P00-T03 mô tả baseline cũ). `npm test`: 16/16 PASS sau npm install.
- Gaps còn lại: Turnstile server-side, idempotency enforcement, rate limit, Telegram escape, error envelope, POS catalog duplicate.
- Evidence: `.agent/evidence/P01-T01/research-log.md`, `.agent/evidence/P02-T01/implementation-plan.md`.
- STATE.json: research_gate + plan_gate → approved; active_task → P03-T01 (implementation).
- CHECKLIST.md: Bước 3, 4 done; Bước 5 (agent coordination) in progress.

## 2026-08-02 — P03-T01 secure order API complete
- Rewrote `functions/api/orders.js`: Turnstile server verify, idempotency (SHA-256 payload hash + key, replay/409), rate limit 20/min/IP-hash, error envelope, body 16KB, safe Telegram post-insert.
- Rewrote `functions/api/telegram.js`: `escapeTelegramHtml` (XSS fix), generic errors, no secrets leaked.
- Added `tests/p03-t01.secure-order-api.test.ts` (24 tests). `npm test`: 40/40 PASS. Secret scan: only known js/app.js anon key.
- Evidence: `.agent/evidence/P03-T01/secure-order-api.md`.
- STATE.json: P03-T01 done; P03-T02 blocked (Supabase policy export R-008); active_task → P03-T03 (POS catalog adapter).

## 2026-08-02 — P03-T03 POS catalog adapter complete
- `js/service-catalog.js`: added `getPaymentServices()` ({n,p,c} từ catalog, c=true khi price=0).
- `js/app.js`: thay 2 mảng hard-code activePaymentServices bằng getPaymentServices(); giữ addCustomService/discount/VietQR/in hóa đơn.
- `tests/p03-t03.pos-service-catalog.test.ts` (5 tests). `npm test`: 45/45 PASS; syntax OK; secret scan OK.
- Evidence: `.agent/evidence/P03-T03/service-catalog-pos-adapter.md`.
- STATE.json: P03-T03 done → active_task P04-T01 (React/Vite shell + route split).

## 2026-08-02 — P04-T01 React/Vite shell complete
- Added react/react-dom/vite/typescript; vite.config root=apps/web; ADR-007 accepted, ADR-008 (no react-router).
- Route adapter `resolveRoute()` giữ `?page=order` + `/`; lazy chunks Booking/Admin/NotFound.
- `js/service-catalog.d.ts`; booking shell dùng getServiceCatalog().
- `npm run build` pass: index 61.61KB gzip (budget ≤180KB), không admin/chart/xlsx/3D trong initial.
- `npm test`: 49/49 PASS. Evidence: `.agent/evidence/P04-T01/react-shell-route-split.md`.
- STATE.json: active_task → P04-T02 (booking funnel).

## 2026-08-02 — P04-T02 Design system + booking funnel complete
- `tokens.ts`, `api.ts` (submitOrder theo orderRequestSchema, idempotency key, validPhone), `BookingWizard.tsx` 4 bước (dịch vụ → thông tin → nhận/trả → review/submit), `BookingPage.tsx` rewrite (hero + service grid + wizard).
- A11y: 44px touch, aria-live/alert, label htmlFor, reduced-motion, next disabled khi chưa hợp lệ.
- Fix: tsconfig include thêm `js/`; đúng relative path; phone chuẩn hóa E.164 trong payload.
- `npm test`: 56/56 PASS. Build: index 61.61KB gzip, Booking chunk 21.04KB gzip. Evidence: `.agent/evidence/P04-T02/booking-funnel.md`.
- STATE.json: active_task → P04-T03 (3D scene); PLAN.json P04-T03 active, ghi chú R-009 cần quyết định asset.

## 2026-08-02 — P04-T03 Procedural 3D viewer complete
- User decision: procedural model (ADR-009) — giải quyết R-009, không cần asset GLB.
- `scene.ts`: resolveAdapter (reduced-motion/≤4 cores/coarse → low-power), dirtVisual lerp #F2EFE9→#6B5A4A, createDirtTexture canvas noise, buildProceduralShoe (9 parts), applyDirtToParts.
- `ShoeViewer.tsx`: scene navy, lights, auto-rotate, resize, pointerdown, full dispose cleanup; slider dirt 0–100%.
- BookingWizard bước 4: toggle preview với React.lazy + Suspense; chunk 3D 130.63KB gzip (≤350KB).
- `npm test`: 64/64 PASS. Build pass. Evidence: `.agent/evidence/P04-T03/shoe-viewer.md`.
- STATE.json: active_task → P04-T04 (2D/reduced-motion fallbacks).

## 2026-08-02 — P04-T04 2D/reduced-motion fallbacks complete
- `poster.ts`: supportsWebGL probe, posterPalette (dùng lại dirtVisual), drawPoster canvas 2D deterministic seed, roundRect guard.
- ShoeViewer restructure: mode '3d'|'poster' (WebGL fail → poster), render-on-demand khi reduced-motion (không rAF liên tục), slider cập nhật cả 3D lẫn 2D (fix thiếu sót P04-T03), dispose texture cũ.
- `npm test`: 70/70 PASS. Build: 3D chunk 131.44KB gzip, shell 61.61KB. Evidence: `.agent/evidence/P04-T04/fallbacks.md`.
- STATE.json: active_task → P05-T01 (quality gates); P03-T02 vẫn blocked R-008.

## 2026-08-02 — P05-T01 Module quality gates audit
- Bundle: shell 61.61KB / 3D 131.44KB / CSS 0.64KB gzip — tất cả trong budget (≤180KB/≤350KB).
- secret_scan: chỉ anon key js/app.js đã biết + false positive zod → PASS.
- Tests 70/70 (9 files), build PASS, agent_sync + context_audit PASS.
- E2E smoke: static-level (router unit 5 case + dist chunks); HAR/Lighthouse nợ (P00-T04).
- Evidence: `.agent/evidence/P05-T01/quality-gates.md`. implementation_gate giữ pending (P03-T02 blocked R-008).
- Bước 5 (agent coordination): các task code-allowed đã xong hết; Bước 6 audit đã chạy. Chờ R-008 để advance.


## 2026-08-03 — ADR-010 resolved; RLS anon probe (P03-T02 prep)
- Owner xác nhận: production = vmakonkiotjkxlhpjwny; catalog chuẩn = repo (7 services); cung cấp anon key (paste chat).
- Decode JWT anon: ref khớp production project. Probe REST (PostgREST):
  - services SELECT: 200 + 4 rows (CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K).
  - orders/order_items SELECT: 200 [].
  - anon INSERT orders/services: 401/42501 violates RLS → RLS enabled (anonymous writes blocked).
  - anon DELETE/PATCH: empty result.
  - orders schema: NOT NULL customer_name (23502 leak); chưa confirm idempotency_key/source từ REST.
- Booking API dùng service_role (functions/api/orders.js:167) → không bị RLS chặn.
- Evidence: .agent/evidence/P03-T02/rls-probe-anon.md. ADR-010 → resolved; STATE notes updated.
- Còn chờ: policy dump (`supabase db dump --schema public`) để soạn lockdown migration hoàn tất P03-T02.

## 2026-08-03 — P05-T01 remediation: catalog sync ADR-011 (4 services production DB)
- Commit c8f408a (owner) sync `js/service-catalog.js` → 4 services production DB (CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K), khớp probe RLS. Nhưng 3 file test + index.html legacy giữ 7 services cũ → audit re-run bắt 14 fail (56/70).
- Fix (remediation thuộc scope P05-T01, tests + legacy UI sync):
  - p03-t01: VALID_PAYLOAD → [CLEAN_STANDARD, REPAIR_SOLE]; quote/total 290000; services string + createSuccessResponse theo giá mới.
  - p03-t03: names/prices [90000,150000,200000,80000], c:true = [], total 520000.
  - p01-T02: total 168000 → 290000. p01-t01: toContainEqual thêm description.
  - p01-t01.spec.ts E2E + index.html: 7 cards cũ → 4 cards mới (trước đây service_ids = [] → checkout legacy fail).
- Re-run: `npm test` 70/70 PASS, `npm run build` PASS (shell 61.61KB / 3D 131.44KB gzip). Lưu ý: phải dùng Node 22+ (nvm) — Node 16 codespace default fail vite/vitest (`crypto.getRandomValues`).
- ADR-011 ghi nhận catalog chuẩn = production DB 4 services; STATE/CURRENT_TASK/evidence P05-T01 cập nhật.
- Vẫn chờ R-008: `supabase db dump --schema public` từ owner để hoàn tất P03-T02 lockdown migration → mở khóa P05-T01 exit → Bước 7.

## 2026-08-03 — R-008 closed: RLS lockdown applied (P03-T02 done)
- Owner cấp Supabase PAT (Management API). Dùng `database/query` thay `supabase db dump` (không cần DB password).
- Schema probe: orders có đủ idempotency_key (uuid), idempotency_payload_hash (text), source, service_items (jsonb) — xác nhận từ trước lockdown.
- Baseline: 5 policies cũ roles=public (orders ALL authenticated + INSERT with_check true, order_items INSERT with_check true, services SELECT active); grants anon/auth/service_role đầy đủ (default). Probe anon INSERT 42501 nhưng cấu hình mơ hồ → lockdown.
- Applied `supabase/migrations/20260803_rls_lockdown.sql` (transaction qua Management API):
  - services: REVOKE write anon/auth; policy SELECT (is_active) anon+auth.
  - orders: REVOKE hết anon; policies authenticated SELECT/INSERT/UPDATE (admin dashboard + POS insert js/app.js:614); không DELETE cho authenticated.
  - order_items: REVOKE ALL anon/auth; chỉ service_role.
- Verify: anon SELECT services 200+4 rows; anon SELECT/INSERT orders 401 42501; anon INSERT order_items 401 42501; pg_policies = 4 policies mới.
- Booking API (service_role bypass) không ảnh hưởng. Evidence: `.agent/evidence/P03-T02/rls-lockdown-applied.md`; PLAN.json P03-T02 → done.
- Next: checkpoint P05-T01 (implementation_gate) → Bước 7 progress report. Rotate anon key production (đã paste chat + dùng probe).
