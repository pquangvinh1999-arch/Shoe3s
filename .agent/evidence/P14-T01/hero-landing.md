# P14-T01 — 3D Hero Landing + Before/After Story Remediation — Evidence

Task: `P14-T01` · Owner: `three-experience-engineer` · Status: `done` (2026-08-03, working tree) · Project: Shoe3s 3D Booking Upgrade

## Trigger
Owner báo sau khi deploy production: **UI không đúng 3D như goal ở plan**. Kiểm chứng:

| Check | Kết quả |
|---|---|
| `resolveRoute('', '/')` | `admin` (AdminPage stub) — ADR-008 giữ routing legacy |
| `https://shoe3s.pages.dev/` | React shell render AdminPage "Khu vực quản trị" |
| 3D viewer (`ShoeViewer`) | Chỉ ở `/?page=order` bước 4 wizard, sau nút toggle |
| Goal (docs/02_3D_UX_SPEC.md) | "3D hero + CTA Đặt lịch", storyboard giày xuất hiện ngay khi tải; câu chuyện bẩn → sạch |

**Root cause:** routing legacy `/` → admin + 3D khuất sau toggle → landing production không có 3D.

## Changes
1. **Router** (`apps/web/src/app/router.ts`): `/` và `''` → `booking` (public landing 3D). Compatibility: `?page=order`, `/booking/`, `/booking` → booking; `?page=admin` → admin. Test `tests/p04-t01.router.test.ts` cập nhật theo rule MASTER_CONTEXT (compatibility redirect/test bắt buộc).
2. **AdminPage** (`apps/web/src/pages/AdminPage.tsx`): auto-redirect về `/admin/` (real legacy dashboard vẫn phục vụ tại path đó) — admin entry không mất.
3. **BookingPage** (`apps/web/src/pages/BookingPage.tsx`): hero 2 cột — copy + CTA trái, **3D viewer phải** (lazy chunk, poster fallback tự động); preset chips **Trước (0.85) / Vừa (0.40) / Sau (0.05)**; story 3 bước "Nhận giày bẩn → Chăm sóc chuyên sâu → Sạch & phục hồi"; giữ `#services` cho CTA anchor.
4. **ShoeViewer** (`apps/web/src/features/viewer/ShoeViewer.tsx`): thêm prop optional `dirt` (controlled) — slider 2 chiều, preset remount không cần; wizard (uncontrolled `initialDirt`/`onDirtChange`) không đổi API.
5. **BeforeAfter** (`apps/web/src/features/viewer/BeforeAfter.tsx`, new): so sánh Trước/Sau 2D bằng `drawPoster` (seed cố định) — Tier 0 safe, không thêm WebGL context (giữ performance strategy "canvas lazy; 1 scene chính").
6. **Styles** (`apps/web/src/styles.css`): `.hero-grid`, `.hero-viewer`, `.preset-row/.preset-chip`, `.story-strip/.story-grid/.story-card/.story-step`, `.ba-*`, responsive ≥768px.

## Verification
| Check | Result |
|---|---|
| `npm test` | **73/73 PASS** (9 files; +1 router case) |
| `npm run build` | PASS — index shell 61.62KB gzip (≤180KB), ShoeViewer 87.87KB gzip (≤350KB), BeforeAfter 0.60KB lazy |
| `secret_scan.py --changed` | PASS (node_modules/zod test file là false positive có sẵn, không trong diff) |
| `agent_sync --check` / `context_audit` | PASS |

## Acceptance (đối chiếu goal)
- [x] `/` production → booking hero có mô hình 3D + slider bẩn→sạch + preset (sau redeploy)
- [x] `/?page=order`, `/booking/` giữ nguyên booking; `/?page=admin` → redirect `/admin/`
- [x] Câu chuyện "giày bẩn → xử lý → sạch/phục hồi": 3D hero + story 3 bước + BeforeAfter
- [x] Không WebGL / mobile → poster 2D (fallback Tier 0 có sẵn, BeforeAfter poster không phụ thuộc WebGL)
- [x] Budget bundle giữ nguyên, 3D vẫn lazy chunk

## Next
- Owner chốt → commit + push main → Cloudflare Pages redeploy (prod branch main) → verify production `/`.
- Debt ngoài scope: revoke legacy anon key + rotate service_role (ADR-012); P00-T04 HAR/Lighthouse.
