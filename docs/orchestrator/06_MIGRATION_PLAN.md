# 06 — Migration strategy

## Nguyên tắc

- Strangler migration, không big bang.
- Mỗi phase kết thúc ở trạng thái deployable/rollbackable.
- Secure data path trước visual enhancement.
- Shadow/canary trước cutover.
- Không thay đổi schema và frontend cùng một deploy nếu rollback phụ thuộc nhau.

## Phase order

### P00 — Baseline và audit

Map code/data/routes, test hiện trạng, scan secret, xác nhận asset 404, RLS và
Cloudflare env names. Không đổi hành vi.

### P01 — Domain extraction

Tạo catalog, order schemas, status constants và compatibility tests. Vẫn chạy
UI cũ.

### P02 — Secure booking API

Tạo Pages Function `/api/orders`, Turnstile, pricing server-side,
idempotency, safe Telegram, staged RLS lockdown.

### P03 — Frontend foundation

Workspace + React/Vite/TS, router adapter giữ `?page=order`, design system,
route splitting. Landing mới chạy với poster/fallback trước.

### P04 — 3D asset pipeline

Licensed GLB, dirty mask, KTX2/meshopt, LOD, poster và asset manifest.

### P05 — 3D booking UX

Canvas lazy, adaptive tiers, scrollytelling, booking wizard và accessibility.

### P06 — Admin incremental migration

Dashboard/booking/POS/finance/CRM module-by-module. Không rewrite tất cả trong
một PR.

### P07 — Quality/security/performance gates

E2E, contract, RLS negative tests, visual, mobile, a11y, performance, recovery.

### P08 — Deploy/cutover

Preview → canary → production, monitoring, rollback rehearsal.

### P09 — Handover

Runbook, architecture, env names, migration list, known limitations, next backlog.

## Rollback

Mỗi phase có:
- tag/commit trước thay đổi;
- compatible DB migration hoặc down/forward-fix plan;
- old static landing retained cho tới P05 stable;
- feature flag `BOOKING_3D_ENABLED`;
- feature flag `SECURE_ORDER_API_REQUIRED`;
- poster fallback;
- no destructive schema drop trong migration window.
