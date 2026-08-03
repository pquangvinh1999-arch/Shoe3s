# P06-T01 — Implementation Status Report (Bước 7)

Task: `P06-T01` · Owner: `project-orchestrator` · Status: **done** · Date: 2026-08-03
Project: Shoe3s 3D Booking Upgrade · HEAD: `9012984`

## Completed
- **P00 (khởi tạo)**: env + canonical context, baseline import Wed3s (không đổi behavior), audit evidence, context gate approved.
- **P01 (tài liệu)**: baseline có typed catalog + order schema + orders API scaffold; 16 tests pass.
- **P02 (nghiên cứu)**: plan approved (plan_gate).
- **P03 (an toàn + catalog)**:
  - P03-T01: secure order API — Turnstile, idempotency, rate limit, error envelope, safe Telegram (40 tests).
  - P03-T02: **RLS lockdown applied 2026-08-03** (R-008 closed) — production `vmakonkiotjkxlhpjwny`: services public read-only, orders authenticated SELECT/INSERT/UPDATE, anon revoke hết, order_items chỉ service_role. Verify: anon SELECT services 200/4 rows; anon SELECT/INSERT orders+order_items 401/42501.
  - P03-T03: POS service list derived từ catalog (45 tests).
- **P04 (UI)**: React/Vite shell route-split (61.6KB gzip), design system + 4-step booking funnel (a11y, idempotent submit), adaptive procedural 3D dirty-to-clean (131.4KB gzip, ADR-009), 2D poster + reduced-motion fallbacks (70 tests).
- **P05 (quality gates)**: bundle trong budget, secret scan PASS, 70/70 tests, build PASS, agent_sync + context_audit PASS; remediation catalog sync ADR-011 (14 test fail → fixed, 70/70).

## Remaining
- P00-T04: HAR/Lighthouse evidence (technical debt — không có browser automation trong codespace; thay bằng static smoke + unit route tests).
- Turnstile site-key widget thật (hiện `local-demo-token`) — deferred tới release-candidate (P12/P13).
- P07: iterative QA loop phiên mới (kế tiếp).
- P08: independent review GPT-5.6 + reviewer thứ hai (immutable commit `9012984`).
- P09–P13: consensus roadmap, remediation, GitHub pipeline, release candidate, deploy Cloudflare.

## Decisions needed
- Rotate anon key production (đã paste chat + dùng probe) trước P12/P13 — owner thực hiện trong dashboard.
- Xác nhận policy set authenticated (admin/POS INSERT) đúng intent nghiệp vụ sau khi admin dashboard migrate sang project production.

## Architecture changes
- ADR-007: React/Vite/TS shell (booking public), giữ legacy static tới cutover.
- ADR-008: route adapter tự parse `?page=order`/`/booking/` (không react-router).
- ADR-009: procedural 3D model (thay licensed GLB) — R-009 resolved.
- ADR-010: production project = `vmakonkiotjkxlhpjwny`; anon key legacy `agcvsogtqxoqlhcubghy` trong js/app.js là debug.
- ADR-011: catalog chuẩn = production DB 4 services (CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K); DB không sync ngược.
- RLS lockdown: baseline policies roles=public (mơ hồ) → policy rõ ràng per-table + revoke grants anon.

## Risks
| Risk | Level | Mitigation |
|---|---|---|
| Booking API phụ thuộc service_role key trong env CF Pages | High | Không commit key; canary P08-T01 verify anon path sau deploy; key phải cấu hình env khi deploy |
| Legacy admin dashboard trỏ project cũ (anon key debug) | Medium | Cutover theo ADR-001; test admin trên project mới trước Bước 12 |
| Node 16 mặc định codespace fail vite/vitest | Low | Dùng Node 22+ qua nvm (đã verify) |
| P00-T04 thiếu browser E2E thật | Medium | Static smoke + Playwright thủ công ở release-candidate (P12) |
| Anon key đã lộ trong chat | High | Rotate trước release; không dùng lại |

## Tests/evidence
- `npm test`: **70/70 PASS** (9 files) — catalog, order schema, secure API, router, funnel, 3D, poster, E2E sample.
- `npm run build`: PASS (tsc strict + vite; shell 61.61KB / 3D 131.44KB gzip / CSS 0.64KB).
- Secret scan: PASS (anon key public js/app.js đã biết + false positive zod).
- Evidence: `.agent/evidence/P00-*`…`P05-T01` (full chain); P03-T02 rls-probe-anon + rls-lockdown-applied.
- Migration: `supabase/migrations/20260803_rls_lockdown.sql` (đã apply + verify).

## Exact next task
`P07-T01` — Run fresh-session iterative QA loop (Bước 8): reproduce → fix → regression → rerun tới gate pass; owner: `test-engineer`; phụ thuộc P06-T01 (done).
