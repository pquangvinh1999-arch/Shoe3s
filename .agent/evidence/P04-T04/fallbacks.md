# P04-T04 — 2D / Reduced-Motion / Device Fallbacks — Evidence

Task: `P04-T04` · Owner: `ux-director` · Status: `done` · Date: 2026-08-02

## Deliverables

- `apps/web/src/features/viewer/poster.ts`:
  - `supportsWebGL()` — probe `webgl2`/`webgl`/`experimental-webgl` trước khi khởi tạo three.js (no-DOM → true để tests/server an toàn).
  - `posterPalette(factor)` — dùng lại `dirtVisual` từ P04-T03 (cùng màu #F2EFE9 → #6B5A4A, không drift).
  - `drawPoster(ctx, dirt, size, seed)` — 2D canvas: body roundRect + toe ellipse + sole + 4 đường laces; noise spots có seed (deterministic), bán kính/bớt theo factor; `roundRect` guard fallback `rect`.
- `apps/web/src/features/viewer/ShoeViewer.tsx` — restructure:
  - **Mode '3d' | 'poster'**: `supportsWebGL()` quyết định mode mặc định; try/catch quanh WebGLRenderer → setMode('poster') khi fail.
  - **Reduced-motion / low-power**: render-on-demand — không chạy rAF liên tục (autoRotate off), chỉ `render()` tại mount/resize/dirt-change/pointerdown; tiết kiệm pin.
  - **Poster mode**: canvas 2D 512×512 cùng slider "Mức độ bẩn" — fallback vẫn tương tác được.
  - Slider giờ cập nhật thật sự cả 3D lẫn 2D (fix thiếu sót P04-T03: effect `[dirt]` đổi texture + `applyDirtToParts` + render lại; dispose texture cũ).
  - Note UI phân biệt: "Trình duyệt không hỗ trợ WebGL — chế độ 2D" vs "Chế độ tiết kiệm năng lượng: ảnh tĩnh".
- `tests/p04-t04.poster.test.ts` — 6 tests: supportsWebGL (1), palette (2), drawPoster với fake ctx (3: vẽ đủ hình, spots tăng theo factor, deterministic seed).

## Verification

- `npm test`: **70/70 PASS** (9 files, +6).
- `npm run build`: PASS. ShoeViewer lazy chunk **131.44 kB gzip** (≤350 kB budget, +0.8 kB từ poster). Initial bundle vẫn 61.61 kB gzip — 2D fallback không vào booking shell.
- WebGL-fail path được guard 2 tầng: probe trước khi mount three + try/catch quanh constructor.
- Cleanup: dispose texture mới/cũ, geometry, material, renderer; cancel rAF; không setState sau unmount.

## Coverage matrix

| Điều kiện | Hành vi |
|---|---|
| WebGL OK + desktop | 3D auto-rotate, pixelRatio ≤2, segments 24, texture 512 |
| WebGL OK + reduced-motion / ≤4 cores / coarse | 3D tĩnh render-on-demand, segments 8, texture 128 |
| WebGL fail | Poster 2D + slider vẫn hoạt động |
| Không DOM (tests/server) | supportsWebGL() = true (mặc định) |

## Files changed

- `apps/web/src/features/viewer/poster.ts` (new), `apps/web/src/features/viewer/ShoeViewer.tsx` (restructure), `tests/p04-t04.poster.test.ts` (new).
