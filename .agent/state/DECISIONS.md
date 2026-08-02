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
