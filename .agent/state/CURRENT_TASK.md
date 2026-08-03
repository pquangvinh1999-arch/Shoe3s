# Current Task

- Task ID: `P14-T01`
- Owner: `three-experience-engineer`
- Status: `done` (2026-08-03, working tree — chờ owner chốt commit/push/redeploy).
- Depends on: `P13-T01` (done — production live).
- Gates: tất cả approved; P14 là vòng remediation theo checklist Bước 15.

## Vấn đề (owner report: "production UI không đúng 3D như goal ở plan")
- **Root cause**: ADR-008 giữ routing legacy → `resolveRoute('', '/')` = `admin`; `https://shoe3s.pages.dev/` (bare root) render `AdminPage` stub "Khu vực quản trị", không phải trang booking 3D. 3D chỉ tồn tại ở `/?page=order` + nằm khuất bước 4 wizard sau nút toggle.
- **Gap vs goal** (docs/02_3D_UX_SPEC.md + MASTER_CONTEXT): thiếu 3D hero, thiếu câu chuyện "giày bẩn → xử lý → sạch/phục hồi" (before/after).

## Changes (working tree)
1. `apps/web/src/app/router.ts` + `tests/p04-t01.router.test.ts`: `/` + `''` → **booking** (public landing 3D — goal); giữ `?page=order`, `/booking/` → booking; `?page=admin` → admin (compatibility). Router test cập nhật theo rule MASTER_CONTEXT "compatibility redirect/test".
2. `apps/web/src/pages/AdminPage.tsx`: auto-redirect `/admin/` (legacy admin entry giữ nguyên qua path real dashboard).
3. `apps/web/src/pages/BookingPage.tsx`: **3D hero** (lazy ShoeViewer, controlled `dirt`, preset chips Trước/Vừa/Sau) + story 3 bước + `#services` giữ CTA anchor.
4. `apps/web/src/features/viewer/ShoeViewer.tsx`: thêm prop controlled `dirt` (wizard vẫn uncontrolled — API cũ không đổi).
5. `apps/web/src/features/viewer/BeforeAfter.tsx` (new): so sánh Trước/Sau bằng poster 2D (`drawPoster`) — không tốn WebGL context thứ 2, hoạt động cả Tier 0.
6. `apps/web/src/styles.css`: hero-grid, preset-chip, story-strip/card, ba-*.

## Verification
- `npm test`: **73/73 PASS** (9 files) · `npm run build`: PASS — shell 61.62KB / ShoeViewer 87.87KB / BeforeAfter 0.60KB gzip (budget ≤180KB/≤350KB ✓).
- `python scripts/secret_scan.py --changed`: PASS · agent_sync OK · context_audit PASS.

## Next action
1. Owner chốt → commit + push main → Cloudflare Pages redeploy (prod branch main).
2. Verify production: GET `/` → booking hero 3D (200); `/?page=order` → booking; `/admin/` → legacy dashboard; `/?page=admin` → redirect.
3. Sau đó: revoke legacy anon key + rotate service_role (ADR-012, ngoài scope P14).
