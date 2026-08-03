# Master Checklist

- [x] Bước 1: Khởi tạo môi trường và context
- [x] Bước 2: Kiểm tra lại tài liệu dự án
- [x] Bước 3: Nghiên cứu trước khi code
- [x] Bước 4: Lập kế hoạch triển khai
- [x] Bước 5: Điều phối agent thực hiện *(P03/P04 code-allowed hoàn tất; P03-T02 RLS lockdown applied 2026-08-03)*
- [x] Bước 6: Kiểm tra chất lượng trong quá trình *(audit + remediation pass; exit criteria đạt — R-008 closed)*
- [x] Bước 7: Báo cáo kết quả *(P06-T01 done — evidence .agent/evidence/P06-T01/implementation-status.md)*
- [x] Bước 8: Kiểm thử lặp trong phiên mới *(P07-T01 done — 70/70, build, secret scan, catalog↔DB khớp)*
- [x] Bước 9: Đánh giá độc lập GPT-5.6 và reviewer thứ hai *(78/100 + 63/100; reports/09_*.md)*
- [x] Bước 10: Tổng hợp kết quả review *(LO-TRINH-FIX-20260803.md — F1..F6)*
- [x] Bước 11: Hoàn thiện dự án theo báo cáo *(P10-T01 done 2026-08-03 — commit c88d8c2: F1 insert cột, F4 idempotency replay, F3 XSS, F2 signup+policy, F6 docs, F5 client production; 72/72 tests, build/typecheck/secret PASS; evidence .agent/evidence/P10-T01/remediation.md)*
- [ ] Bước 12: Commit, push và kiểm tra GitHub pipeline *(owner: revoke legacy anon key dashboard + rotate service_role; chờ GitHub/Cloudflare access)*
- [ ] Bước 13: Release candidate và rollback rehearsal
- [x] Bước 14: Deploy Cloudflare *(P13-T01 done 2026-08-03 — production https://shoe3s.pages.dev live; admin /admin/ + turnstile widget + admin user verified; evidence .agent/evidence/P13-T01/production-deploy.md)*
