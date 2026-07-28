# P00-T03 Evidence Checklist

## Goal
Hoàn thiện audit P00-T03 bằng cách đóng các file evidence cần thiết và xác định rõ những gì còn thiếu.

## Required evidence files
- `.agent/evidence/P00-T03/security-audit.md`
  - Ghi nhận kết quả audit an ninh tổng thể.
  - Bao gồm: public Supabase anon key exposure, direct client-side `orders` writes, admin/Supabase risks, XSS/HTML injection risk.
- `.agent/evidence/P00-T03/rls-secret-inventory.md`
  - Ghi nhận inventory secrets và RLS evidence.
  - Bao gồm: repo secret scan, env var inventory, lack of on-disk Supabase policy/schema files, runtime Supabase access patterns.
- `.agent/evidence/P00-T03/supabase-policy-evidence.md`
  - Ghi nhận live policy behavior với anon key.
  - Bao gồm: HTTP status, endpoints thử nghiệm, kết luận về anonymous insert/read.
- `.agent/evidence/P00-T03/supabase-policy-export-request.md`
  - Ghi nhận yêu cầu export Supabase policy/schema từ upstream.
  - Bao gồm: lý do cần export, command đề xuất, các file template dùng cho migration.

## Acceptance criteria
- `security-audit.md` nêu rõ rủi ro hiện tại và những gap của repo.
- `rls-secret-inventory.md` xác nhận không có policy/schema file trong repo và chỉ ra runtime access patterns.
- `supabase-policy-evidence.md` cung cấp bằng chứng thực tế cho policy state hiện tại.
- `supabase-policy-export-request.md` chỉ ra cần thêm export file để hoàn thiện P00-T03.
- Có bằng chứng cụ thể rằng public anon key hiện đang cho phép:
  - `GET /rest/v1/orders`
  - `GET /rest/v1/costs`
  - `POST /rest/v1/orders`
- Phải ghi rõ: repo không có đủ Supabase policy export để audit hoàn chỉnh.

## Current status of evidence files
- `.agent/evidence/P00-T03/security-audit.md` — exists, contains security/RLS findings and live policy conclusions. Status: draft/completed; review for explicit threat model and remediation steps.
- `.agent/evidence/P00-T03/rls-secret-inventory.md` — exists, contains secret inventory, env vars, and runtime access patterns. Status: completed for current repo state; verify if any local policy/schema files are later added.
- `.agent/evidence/P00-T03/supabase-policy-evidence.md` — exists, contains live anon key policy tests and results. Status: completed with evidence of `GET /rest/v1/orders`, `GET /rest/v1/costs`, and `POST /rest/v1/orders`.
- `.agent/evidence/P00-T03/supabase-policy-export-request.md` — exists, contains the request for Supabase policy/schema export and migration template references. Status: completed as a blocking evidence artifact; note that actual policy/schema export is still pending.

## Recommended next actions
1. Kiểm tra lại nội dung của các file evidence đang có và bổ sung bằng chứng trực tiếp.
2. Nếu có thể, lấy Supabase export policy/schema từ dự án upstream.
3. Nếu không thể lấy export ngay, trình bày rõ điều đó trong evidence request và giữ bản ghi live runtime.
4. Sau khi `P00-T03` đủ evidence, chuyển sang `P00-T04` hoặc `P01-T01` tùy mức độ hoàn thiện audit.
