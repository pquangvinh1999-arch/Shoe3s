# P00-T03 Evidence Checklist Review

## Review guidance for each evidence file

### `.agent/evidence/P00-T03/security-audit.md`
- Confirm it includes:
  - public Supabase anon key exposure in client-side JS
  - direct browser-side `supabaseClient.from('orders').insert()` and read access
  - note về anonymous `GET /rest/v1/orders` và `POST /rest/v1/orders`
  - threat model cho người dùng không xác thực và attacker xss payload
  - remediation recommendations: di chuyển auth key ra backend, thêm RLS/role-based access, CSP, input sanitization

### `.agent/evidence/P00-T03/rls-secret-inventory.md`
- Confirm it includes:
  - repository scan kết quả không có `supabase/policies`, `supabase/schema`, `auth` config files
  - env vars hoặc secrets được xác định nếu repo chứa cấu hình deploy
  - ghi rõ runtime access patterns: public anon key, browser-only Supabase client, Cloudflare Functions backend cho Telegram
  - gap: chưa có policy export nên không thể đánh giá RLS đầy đủ

### `.agent/evidence/P00-T03/supabase-policy-evidence.md`
- Confirm nó chứa:
  - các HTTP request/response cụ thể với status code
  - `GET /rest/v1/orders` => `200 OK`
  - `GET /rest/v1/costs` => `200 OK`
  - `POST /rest/v1/orders` => `201 Created`
  - ghi chú rằng testing được thực hiện với browser publish anon key
  - kết luận về mức độ least privilege hiện tại và hành động cần thực hiện

### `.agent/evidence/P00-T03/supabase-policy-export-request.md`
- Confirm nó bao gồm:
  - lý do cần export policy/schema để audit RLS và migration
  - đề xuất command `supabase db dump` hoặc `supabase gen types` nếu có repo access
  - reference tới `orchestrator/templates/supabase/002_lockdown_after_cutover.sql`
  - note rằng bản export hiện chưa có trong repo nên task P00-T03 chưa hoàn toàn done

## Recommended review checklist
- [ ] evidence file tồn tại
- [ ] evidence file có bằng chứng và kết luận cụ thể
- [ ] mỗi file rõ trách nhiệm và gap hiện tại
- [ ] tất cả file cùng nhau xác nhận: live anon key + thiếu policy export
- [ ] nếu cần, note thêm `pending upstream export` hoặc `requested policy dump`
