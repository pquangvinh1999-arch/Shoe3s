# 03 — Security architecture

## Threat model tối thiểu

Tài sản:
- PII khách hàng.
- Dữ liệu đơn hàng/doanh thu/chi phí.
- Supabase access.
- Telegram bot.
- Admin session.
- Payment configuration.
- Invoice/discount logic.

Đối thủ:
- Bot spam public booking.
- Người sửa request client.
- Stored XSS qua tên/dịch vụ/ghi chú.
- User authenticated nhưng không có quyền admin.
- Supply-chain script CDN bị thay đổi.
- Secret lộ qua git history/log.

## Secure public order path

Public client chỉ gửi:

```json
{
  "customer_name": "string",
  "phone": "string",
  "service_ids": ["clean_full"],
  "pickup_address": "optional string",
  "note": "optional string",
  "turnstile_token": "string",
  "idempotency_key": "uuid"
}
```

Server phải:
1. Kiểm tra method/content-type/body size.
2. Validate Turnstile server-side.
3. Validate Zod schema và giới hạn độ dài.
4. Normalize số điện thoại.
5. Load catalog tin cậy.
6. Tính `total`, `services`, `status`, `created_at` server-side.
7. Enforce idempotency.
8. Insert qua server credential.
9. Gửi Telegram sau insert thành công.
10. Return response tối thiểu; không trả DB/internal error.

## RLS rollout

Không chạy lockdown trước cutover.

1. Audit policy hiện tại và lưu evidence.
2. Deploy API.
3. Chuyển public form sang API.
4. Canary test.
5. Revoke anonymous direct write.
6. Enable/verify RLS.
7. Admin policies dựa trên ownership/role thực, không chỉ `authenticated`.
8. Test negative cases bằng anon/authenticated/non-admin/admin.

## XSS controls

- Không dùng `innerHTML` với data từ DB/form.
- React mặc định render text; không dùng `dangerouslySetInnerHTML`.
- Telegram `parse_mode=HTML` phải escape `&`, `<`, `>`, `"`.
- Receipt dùng DOM text nodes hoặc escape helper.
- CSP không cho inline script khi migration hoàn tất.
- Tự host/pin dependency thay cho CDN runtime.

## Secrets

Secret:
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID` nếu coi là private
- Turnstile secret
- deploy tokens

Không phải secret nhưng vẫn là config:
- Supabase publishable/anon key (an toàn chỉ khi RLS đúng)
- VietQR bank identifier/account hiển thị cho thanh toán
- public site key Turnstile

Quy tắc:
- `.dev.vars`/`.env*` không commit.
- `.env.example` chỉ tên biến.
- Scan cả git history nếu token từng lộ.
- Rotate token đã lộ; xóa khỏi HEAD không vô hiệu token cũ.
- Log redaction.

## API abuse controls

- Turnstile.
- Body size limit.
- Field length limits.
- Idempotency unique constraint.
- Rate limit theo hash IP/phone khi phù hợp, không lưu raw IP dài hạn.
- Generic error responses.
- Timeout cho Telegram.
- Không rollback order chỉ vì Telegram lỗi; ghi notification state để retry.

## Admin

- Validate session server-side cho thao tác tài chính.
- Role từ trusted app metadata hoặc bảng membership.
- Không dựa vào `user_metadata`.
- Sensitive actions có audit log:
  - thay total/discount;
  - hoàn thành/hủy đơn;
  - tạo/xóa chi phí;
  - thay catalog;
  - đổi payment config.

## Headers

Tối thiểu:
- Content-Security-Policy
- Referrer-Policy
- Permissions-Policy
- X-Content-Type-Options
- frame-ancestors trong CSP
- HSTS trên custom domain sau khi xác nhận HTTPS

## Supply chain

- Không dùng Tailwind CDN ở production target.
- Pin versions và commit lockfile.
- Dependency review.
- npm audit chỉ là signal, không phải bằng chứng duy nhất.
- Không tự động nâng major và deploy production.
