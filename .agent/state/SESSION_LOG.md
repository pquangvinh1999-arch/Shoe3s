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

