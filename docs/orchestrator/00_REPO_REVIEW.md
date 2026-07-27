# 00 — Review hiện trạng repo Shoe3s

## Snapshot đã đọc

- Repo: `pquangvinh1999-arch/Shoe3s`
- Default branch: `main`
- Kiểu triển khai: static Cloudflare Pages + Pages Function.
- Frontend: Vanilla HTML/CSS/JS, Tailwind CDN, Chart.js, Font Awesome, Supabase JS, SheetJS.
- Luồng công khai: `/?page=order`.
- Luồng nội bộ: `/` + Supabase Auth.
- Backend server-side hiện thấy: `functions/api/telegram.js`.
- Data: Supabase, tối thiểu có `orders`, `costs`.
- Các trạng thái đang được code sử dụng:
  - `Chờ thanh toán`
  - `Chờ nhận đơn`
  - `Đã hoàn thành`

Review này là static code review. Chưa có quyền xác nhận:
- RLS/policy thật trong Supabase.
- Dữ liệu production.
- Cloudflare environment variables.
- Logs, analytics hoặc cấu hình domain production.

## Điểm đang hoạt động cần giữ

1. Điều hướng bằng query `?page=order`.
2. Đăng nhập admin qua Supabase Auth.
3. Booking tạo record trong `orders`.
4. Telegram notification sau booking.
5. Booking chuyển sang POS để checkout.
6. POS quản lý số lượng, dịch vụ custom, giảm giá.
7. QR VietQR.
8. In hóa đơn 58 mm.
9. Dashboard, finance, CRM dùng dữ liệu `orders`/`costs`.
10. Cloudflare Pages auto-deploy.

## Phát hiện ưu tiên cao

### R1 — Public client quyết định dữ liệu tài chính

Frontend hiện gửi trực tiếp `customer_name`, `phone`, `services`, `total`,
`status`, `created_at` vào Supabase. Giá được tính từ map phía trình duyệt.
Nếu RLS cho phép anonymous insert rộng, người gọi API có thể giả total/status
hoặc spam dữ liệu mà không qua UI.

**Xử lý:** tạo `/api/orders` server-side, validate schema, lấy giá từ catalog
server-side, sinh status/time server-side, Turnstile + idempotency; sau cutover
mới khóa RLS public insert.

### R2 — Stored XSS / HTML injection

Nhiều giá trị database và input được nối thẳng vào `innerHTML`, table rows,
Telegram HTML và nội dung hóa đơn. Dữ liệu booking là public input nên có thể
đi qua DB rồi chạy trong admin.

**Xử lý:** React text rendering hoặc DOM `textContent`; encode Telegram HTML;
sanitize chỉ cho rich text thật sự; CSP chặt.

### R3 — Dữ liệu/catalog bị lặp

Tên và giá dịch vụ xuất hiện ở:
- HTML service cards.
- `pricingMap`.
- `activePaymentServices`.
- Parse chuỗi booking sang POS.

Điều này gây lệch giá/logic khi cập nhật.

**Xử lý:** một `serviceCatalog` typed, mỗi dịch vụ có stable `id`, tên, giá,
contact pricing và trạng thái active. Persist `service_items` có ID/qty/unit
price; giữ `services` string làm compatibility view trong giai đoạn chuyển đổi.

### R4 — Asset slideshow tham chiếu file đã xóa

Logic vẫn gọi `Pic1` đến `Pic6`, trong khi lịch sử repo cho thấy `Pic5` và
`Pic6` đã bị xóa. Cần kiểm tra Network 404 và sửa manifest asset.

### R5 — Bundle chung cho public và admin

Landing public tải Chart.js, SheetJS, Supabase admin logic, Font Awesome,
Tailwind CDN và toàn bộ app. Điều này làm LCP/JS parsing nặng trước khi 3D được
thêm.

**Xử lý:** route-level code splitting; booking shell và 3D là chunk riêng;
admin/chart/xlsx chỉ tải sau auth và đúng route.

### R6 — Audit cũ chưa đủ sâu

`docs/AUDIT_3S.md` mới mô tả tổng quan UI, chưa chứng minh RLS, API abuse,
XSS, CSP, dependency pinning, performance budgets hoặc test regression.

## Điểm tích cực

- Telegram token đã được chuyển sang Cloudflare Function env.
- Luồng booking và POS đã có liên kết `pendingBookingId`.
- Dự án đã tách `css/app.css` và `js/app.js`.
- Có AG Kit `.agents/` khá đầy đủ.
- Hệ thống hiện tại nhỏ, phù hợp migration incremental thay vì big-bang rewrite.

## Kết luận kỹ thuật

Không nên “gắn Three.js vào index.html” trực tiếp. Hướng phù hợp là:

1. Đóng băng hành vi bằng tests.
2. Khóa API booking.
3. Tách domain/catalog.
4. Tạo React/Vite/TypeScript booking app với adapter giữ route/data cũ.
5. Lazy-load 3D và fallback.
6. Migrate admin từng module sau khi booking ổn định.
