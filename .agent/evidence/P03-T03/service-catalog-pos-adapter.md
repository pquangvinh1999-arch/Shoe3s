# P03-T03 Shared Service Catalog + POS Compatibility Adapter — Evidence

Status: complete. Date: 2026-08-02.

## Problem
- `js/app.js` POS section hard-coded the same 7 services (names/prices/custom flags) in two places (initial list + `clearPOS()` reset). Duplicate of `js/service-catalog.js` → risk of price/label drift (R3 in 00_REPO_REVIEW, ADR-004).

## Changes
- `js/service-catalog.js`: added `getPaymentServices()` — derives POS items `{n, p, c}` from active catalog entries; `c: true` (custom price) khi `priceVnd === 0` (Dán Sole, Thay đế, Vệ sinh túi sách) — khớp behavior cũ. Exported + exposed as `window.getPaymentServices`.
- `js/app.js`: thay 2 mảng hard-code (`activePaymentServices` khởi tạo và trong `clearPOS()`) bằng `getPaymentServices()`, với fallback `[]` nếu function chưa load. Thứ tự hiển thị giữ nguyên nhờ `sortOrder` (10..70).
- Không đổi: `addCustomService()`, `offlineSelected`, discount, VietQR, in hóa đơn 58mm, label/total/status.

## Tests (`tests/p03-t03.pos-service-catalog.test.ts`, 5 tests)
- POS list length = số active services.
- Names/prices khớp chính xác legacy (7 dịch vụ, 69k/139k/99k/139k/0/0/0).
- Zero-priced → `c: true`; priced → `c: false`.
- `sortOrder` sắp xếp đúng thứ tự hiển thị.
- Tổng priced services = 446,000 VND (khớp 69k+139k+99k+139k).

## Verification
- `npm test` → 5 files, 45 tests PASS (gồm P03-T01 24 tests).
- `node --check js/app.js` → syntax OK.
- `python scripts/secret_scan.py` → chỉ còn `js/app.js` anon key đã biết (public publishable, documented) + node_modules false positive.

## Note
- `js/app.js` được load với `defer` (không module) nhưng `service-catalog.js` (module) đã set `window.getPaymentServices` trước khi app.js chạy; fallback `[]` an toàn nếu thứ tự tải thay đổi.

## Next
- P03-T02 RLS cutover (blocked: policy export R-008).
- P04-T01 React/Vite shell + route split.
