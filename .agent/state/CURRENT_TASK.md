# Current Task

- Task ID: `P10-T01`
- Owner: `project-orchestrator`
- Status: `active` — remediation theo LO-TRINH-FIX-20260803.md
- Depends on: `P09-T01` (done — consensus roadmap).
- Allowed: code + tests + docs + evidence (remediation F1–F6).
- Gate state: `independent_review_gate = approved`. Release candidate gate chờ remediation hoàn tất.
- Fixes (ưu tiên):
  - **F1 (Critical)**: booking API insert sai cột schema production — `buildLegacyOrderData` trả `phone`/`total`/`pickup_address` nhưng DB có `phone_number`/`total_amount`/`address` → 500. Map đúng cột.
  - **F2 (High)**: signup mở (`disable_signup=false`) + policy authenticated `USING(true)` → PII leak. Tắt signup + thu hẹp policy theo admin claim.
  - **F3 (High)**: XSS admin — escape HTML tại 4 sink `innerHTML` (app.js:262/289/294/393).
  - **F4 (High)**: unique partial index `idempotency_key` + catch 23505 → replay.
  - **F5 (High)**: migrate admin/POS client `js/app.js` → production project (cần anon key mới; tách riêng sau F1-F4).
  - **F6 (Medium)**: docs — ADR-010 ghi chú superseded bởi ADR-011.
- Verify sau mỗi fix: tests + build; F2/F4 cần probe thật qua Management API/anon.
- Next action: F1 → F4 → F3 → F2 → F6 → F5 → canary POST thật → P10 done → Bước 12 (pipeline) → 13 (release candidate).
