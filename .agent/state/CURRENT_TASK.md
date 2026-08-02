# Current Task

- Task ID: `P05-T01`
- Owner: `quality-gate`
- Status: `active`
- Goal: Module quality gates and remediation.
- Depends on: `P03-T02` (blocked — R-008 policy export), `P04-T04` (done).
- Allowed: audits, tests, evidence, documentation. No feature code unless remediation.
- Required evidence:
  - `.agent/evidence/P05-T01/`
- Gate state: `implementation_gate = pending`; module review trước khi chuyển Bước 6.
- Checks:
  1. Bundle audit: booking shell ≤180KB gzip (hiện 61.6KB), 3D chunk ≤350KB gzip (hiện 131.4KB);
  2. Secret scan toàn repo (không secret mới ngoài anon key đã biết);
  3. `npm test` + `npm run build` xanh;
  4. E2E smoke cơ bản (nếu môi trường cho phép — codespace không browser automation → dùng static checks);
  5. Evidence của P00-T04 (HAR/Lighthouse) còn pending — ghi rõ nợ kỹ thuật;
  6. P03-T02 vẫn blocked (R-008) — defer, không mở rộng scope.
- Next action: chạy audit bundle + secret_scan + tổng hợp báo cáo gate → evidence → chuyển sang Bước 6 (implementation gate).
