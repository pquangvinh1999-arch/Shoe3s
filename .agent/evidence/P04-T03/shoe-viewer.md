# P04-T03 — Adaptive 3D Dirty-to-Clean Scene — Evidence

Task: `P04-T03` · Owner: `domain-architect` · Status: `done` · Date: 2026-08-02

## Decision (R-009 resolved)

User decision: **procedural model** — ADR-009 accepted (`DECISIONS.md`). Không phụ thuộc asset GLB licensed; có thể thay `buildProceduralShoe()` bằng GLB sau nếu có asset hợp lệ.

## Deliverables

- `apps/web/src/features/viewer/scene.ts` — pure logic, testable:
  - `resolveAdapter()`: low-power detect (reduced-motion OR ≤4 cores OR coarse pointer) → pixelRatio 1, autoRotate off, segments 8, texture 128px; cao cấp: ratio 2, segments 24, 512px.
  - `dirtVisual(factor)`: clean `#F2EFE9` → dirty `#6B5A4A` lerp, roughness 0.55→0.95, metalness 0.05→0.15.
  - `createDirtTexture(size, factor)`: canvas noise spots (0–180 hạt, bán kính theo factor).
  - `buildProceduralShoe(segments)`: body box + toe sphere + sole + collar cylinder + 5 laces; trả `ShoePart[]` (mesh + baseColor + baseRoughness).
  - `applyDirtToParts()`: cập nhật material theo factor.
- `apps/web/src/features/viewer/ShoeViewer.tsx` — React wrapper: scene nền navy #0B2B46, hemisphere + directional light, auto-rotate 0.006 rad/frame (tắt khi low-power), resize observer, pointerdown xoay nhẹ, cleanup đầy đủ (dispose geometry/material/texture/renderer, cancel RAF). Slider "Mức độ bẩn" 0–100%, `aria-label`, min-touch 44px. Note "Chế độ tiết kiệm năng lượng" khi không auto-rotate.
- `BookingWizard` bước 4: nút toggle "Xem mô hình 3D" — `React.lazy(() => import('../viewer/ShoeViewer.tsx'))` + Suspense fallback; chunk 3D **không** nằm trong initial bundle.
- `tests/p04-t03.shoe-viewer.test.ts` — 8 tests: adapter 3 (default/degrade/≤4 cores), dirtVisual 2 (interp/clamp), build 3 (part count, segment consistency, applyDirt).

## Verification

- `npm test`: **64/64 PASS** (8 files).
- `npm run build`: PASS. Chunk `ShoeViewer-*.js` = **130.63 kB gzip** ≤ 350 kB budget. Initial bundle vẫn 61.61 kB gzip — 3D không làm phình booking shell.
- Cleanup không rò rỉ: unmount dispose toàn bộ resources; không `setState` sau unmount (`disposed` flag).
- Không đụng legacy `index.html`/`js/app.js`/admin; route compatibility giữ nguyên.

## Budget check

| Bundle | gzip | Budget | OK |
|---|---|---|---|
| index (booking shell) | 61.61 kB | ≤180 kB | ✓ |
| ShoeViewer (3D, lazy) | 130.63 kB | ≤350 kB | ✓ |

## Files changed

- `apps/web/src/features/viewer/scene.ts` (new), `apps/web/src/features/viewer/ShoeViewer.tsx` (new), `apps/web/src/features/booking/BookingWizard.tsx` (preview toggle + lazy), `tests/p04-t03.shoe-viewer.test.ts` (new), `package.json`/`package-lock.json` (three, @types/three), `.agent/state/DECISIONS.md` (ADR-009).
