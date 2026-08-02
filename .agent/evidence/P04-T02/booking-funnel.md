# P04-T02 — Design System & Booking Funnel — Evidence

Task: `P04-T02` · Owner: `ux-director` · Status: `done` · Date: 2026-08-02

## Deliverables

- `apps/web/src/design/tokens.ts` — design tokens (ink-950 #07111F, navy-800 #0B2B46, cyan-500 #19B8E6, copper-500 #C77A3D, mist-50 #F5FAFC, danger-500 #D64545, min-touch 44px). Tokens trùng giá trị CSS vars trong `styles.css` (không duplicating drift).
- `apps/web/src/features/booking/api.ts` — client `submitOrder()` gọi `POST /api/orders` theo `orderRequestSchema` (phone tự chuẩn hóa sang E.164 `84…`, service_ids phải tồn tại trong catalog), `createIdempotencyKey()` = `crypto.randomUUID()`, `validPhone()`, `computeQuote()` dựa trên catalog (giá 0 → "Liên hệ báo giá").
- `apps/web/src/features/booking/BookingWizard.tsx` — wizard 4 bước:
  1. Chọn dịch vụ (checkbox từ catalog, hiển thị giá, min touch 44px)
  2. Thông tin khách (name, phone có pattern/validation)
  3. Nhận/trả giày (địa chỉ + ghi chú, optional)
  4. Review báo giá → submit (nút giữ trạng thái submitting, retry tạo key mới khi lỗi server)
- `apps/web/src/pages/BookingPage.tsx` — hero + service grid (styles sẵn có trong `styles.css`) + wizard.
- `tests/p04-t02.booking-funnel.test.ts` — 7 tests.

## Verification

- `npm test`: **56/56 PASS** (7 files; +7 mới: validPhone 3, quote 2, idempotency 1, submit 2).
- `npm run build` (tsc strict + vite): PASS — index 61.61 kB gzip (budget ≤180 kB), BookingPage chunk 21.04 kB gzip; không admin/3D trong initial bundle.
- `tsconfig.json`: thêm `js/` vào `include` để tsc resolve `.js`+`.d.ts` shared modules.
- Không đụng `index.html`, `js/app.js`, admin, route compatibility (`?page=order` vẫn hoạt động — router P04-T01 giữ nguyên).

## A11y / UX decisions

- Focus hoàn toàn bằng DOM order: button back/next lẫn nhau, không focus trap cần thiết cho flow tuyến tính.
- `aria-live="polite"` cho trạng thái bước + màn kết quả; `role="alert"` cho lỗi.
- Touch target tối thiểu 44px (`min-height` trên input/button/checkbox option).
- `prefers-reduced-motion` reduce transitions (CSS).
- Label gắn với input qua `htmlFor`; form không thao tác được nếu bước chưa hợp lệ (next disabled khi: bước 1 không chọn, bước 2 thiếu name/phone không hợp lệ).

## Contract compliance

- Payload gửi đi đúng `orderRequestSchema` (đã verify bằng test thật qua schema): `{customer_name, phone(normalized), service_ids, pickup_address?, note?, turnstile_token, idempotency_key}`.
- Server vẫn là nguồn sự thật: quote chỉ để hiển thị "tạm tính", total thật từ server response (`result.quote.total_vnd`).
- Error envelope server hiển thị đúng `message` từ JSON (test 429 RATE_LIMITED).

## Documented limitation / follow-up

- `turnstile_token` hiện dùng `'local-demo-token'` — giống hệt fallback của `js/app.js` legacy. Wiring Turnstile widget thật (site-key) thuộc bước release-candidate/deploy (P03-T02 + canary), không thuộc task này.
- Upload ảnh trước/sau và 3D preview (P04-T03/P04-T04) chưa nối vào wizard — đúng thứ tự plan.

## Files changed

- `apps/web/src/design/tokens.ts` (new), `apps/web/src/features/booking/api.ts` (new), `apps/web/src/features/booking/BookingWizard.tsx` (new), `apps/web/src/pages/BookingPage.tsx` (rewrite), `tests/p04-t02.booking-funnel.test.ts` (new), `tsconfig.json` (include `js`).
