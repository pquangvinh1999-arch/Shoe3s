# Phân tích ảnh ý tưởng

## 1. Before/After sneaker image

Điểm mạnh:
- Split dọc kể câu chuyện ngay trong một khung hình.
- Dirty/clean contrast rất rõ, phù hợp hero và conversion.
- Heading lớn tạo cảm giác quảng cáo mạnh.

Áp dụng cho Shoe3s:
- Tạo thanh scrub dọc có thể kéo/keyboard.
- Một model giày dùng material blend mask từ bẩn sang sạch, tránh render hai scene nặng.
- Copy thương hiệu nguyên bản, ví dụ “HỒI SINH ĐÔI GIÀY CỦA BẠN”; không sao chép layout/text y hệt.
- Mobile: scrub full-width; desktop: hero split với booking CTA.
- Fallback: poster WebP/AVIF before-after khi WebGL yếu hoặc reduced motion.

## 2. 3S shoe logo concept

Điểm mạnh:
- Chữ 3S hòa với silhouette giày, nhận diện dịch vụ nhanh.
- Navy + copper cho cảm giác premium/thủ công.

Áp dụng:
- Dùng navy/cyan làm màu chính, copper chỉ làm accent 5–10%.
- Có thể animate outline logo thành đường chuyển động dẫn vào model giày.
- Cần vector hóa sạch, nền trong suốt và kiểm tra quyền sử dụng trước production.
- Không dùng hiệu ứng kim loại nặng ở mọi component; giữ logo/hero làm điểm nhấn.

## Quyền tài sản

Hai ảnh là file do người dùng cung cấp. Trong asset manifest đánh dấu `rights_status=unverified`, `usage=reference-only` cho đến khi chủ dự án xác nhận quyền sử dụng hoặc tạo asset nguyên bản thay thế.
