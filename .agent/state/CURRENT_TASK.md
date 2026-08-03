# Current Task

- Task ID: `P10-T01`
- Owner: `project-orchestrator`
- Status: `done` (2026-08-03, commit `c88d8c2`) — remediation F1–F6 hoàn tất.
- Depends on: `P09-T01` (done — consensus roadmap).
- Gates: `independent_review_gate = approved`; `release_candidate_gate`/`deployment_gate` = blocked → chờ Bước 12 (P11 push/CI).

## Completed fixes (verify evidence .agent/evidence/P10-T01/remediation.md)
- **F1 (Critical)**: booking insert dùng `buildSupabaseOrderPayload` → cột production `phone_number`/`total_amount`/`address`; giữ `buildLegacyOrderData` cho response/telegram.
- **F4 (High)**: catch 23505 → replay raced duplicate; unique index `orders_idempotency_key_uq` đã tồn tại sẵn (verify pg_indexes), migration file = idempotent safeguard.
- **F3 (High)**: `esc()` + escape mọi sink innerHTML user-data trong `js/app.js`.
- **F2 (High)**: `disable_signup=true` (verify signup 422); policy orders → `is_admin()` (SECURITY DEFINER); verify anon orders 42501, services 200.
- **F6 (Medium)**: ADR-010 marked superseded by ADR-011.
- **F5 (High)**: `js/app.js` → production `vmakonkiotjkxlhpjwny` với publishable key mới `sb_publishable_WPMLea8mF...` (chưa từng lộ; verify REST 200/42501); `asset_inventory.json` cập nhật.

## Verification
- 72/72 tests PASS · build PASS · typecheck PASS · secret scan PASS · agent_sync OK · context_audit PASS.

## Next action
1. **Owner action**: revoke legacy anon key cũ trong Dashboard → Settings → API keys (Management API không hỗ trợ — id `anon` không phải UUID); rotate legacy service_role key trước release.
2. Bước 12: `P11-T01` push branch/PR + CI green (cần GitHub/Cloudflare access từ owner).
3. Bước 13: `P12-T01` release candidate + rollback rehearsal. Bước 14: `P13-T01` deploy + canary POST thật `/api/orders`.
