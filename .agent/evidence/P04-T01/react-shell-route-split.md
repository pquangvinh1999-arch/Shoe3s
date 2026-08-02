# P04-T01 React/Vite Shell + Route Split — Evidence

Status: complete. Date: 2026-08-02.

## Changes
- `package.json`: thêm `react`, `react-dom` (runtime), `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom` (dev). ADR-007: accepted sau spike này; ADR-008: route adapter nhẹ, không react-router.
- `vite.config.ts`: root = `apps/web`, test root = repo root (giữ vitest đang chạy cả tests/), build → `apps/web/dist`.
- `tsconfig.json`: strict, bundler resolution, `allowImportingTsExtensions`, `allowJs` (cho `js/service-catalog.js` + `.d.ts`).
- `apps/web/index.html` + `src/main.tsx`: entry; lazy chunks qua React.lazy + Suspense.
- `src/app/router.ts`: adapter `resolveRoute(search, pathname)` → `booking` (khi `?page=order` hoặc `/booking/`), `admin` (`/`), `unknown`. **Không đổi route legacy: `?page=order` và `/` vẫn là gốc.**
- `src/pages/BookingPage.tsx`: booking shell tạm — hero brand + CTA + danh sách dịch vụ **từ `getServiceCatalog()`** (nguồn sự thật duy nhất, ADR-004).
- `src/pages/AdminPage.tsx` / `NotFoundPage.tsx`: placeholder admin gate + 404.
- `js/service-catalog.d.ts`: type declarations cho module JS thuần (strict mode).
- `tests/p04-t01.router.test.ts`: 4 tests route compatibility.

## Verification
- `npm test` → 6 files, 49 tests PASS.
- `npm run build` → tsc strict pass + vite build success.
- Bundle output (`apps/web/dist/assets/`, gzip):
  - `index-DPAEJA8P.js` — **61.61 kB** (React core; booking shell ≤ 180KB budget ✓)
  - `BookingPage-*.js` — 1.09 kB (lazy)
  - `AdminPage-*.js` — 0.29 kB (lazy, không vào public initial)
  - `NotFoundPage-*.js` — 0.26 kB (lazy)
  - CSS 0.64 kB
  - Admin/chart/xlsx/3D **không xuất hiện** trong initial bundle ✓
- `python scripts/secret_scan.py` → chỉ `js/app.js` anon key đã biết.

## ADR-007 spike evidence
- Vite + React 19 + TS strict build/deploy path với Cloudflare Pages compatible (static output, no SSR) — PASS.
- Fallback Vanilla TS không cần dùng.

## Next
- P04-T02 design system + booking funnel (dùng tokens §6 MASTER_CONTEXT).
- P04-T03 adaptive 3D (three/R3F lazy chunk; budget ≤350KB gzip).
