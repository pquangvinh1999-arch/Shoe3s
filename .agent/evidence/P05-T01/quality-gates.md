# P05-T01 — Module Quality Gates — Evidence

Task: `P05-T01` · Owner: `test-engineer` · Status: `active (audit run; exit blocked by R-008)` · Date: 2026-08-02

## Gate checklist

### 1. Bundle audit (performance budget — docs/05)
| Bundle | gzip | Budget | PASS |
|---|---|---|---|
| index (booking shell) | 61.61 kB | ≤180 kB | ✓ |
| BookingPage chunk | 21.34 kB | — | ✓ |
| ShoeViewer (3D lazy) | 131.44 kB | ≤350 kB | ✓ |
| CSS | 0.64 kB | — | ✓ |

3D chunk chỉ tải khi user mở preview (React.lazy) — không vào initial.

### 2. Secret scan
`python scripts/secret_scan.py` → chỉ 2 hits:
- `js/app.js` — anon key Supabase đã biết, public client key (documented).
- `node_modules/zod/...` — false positive.
→ PASS, không có secret mới.

### 3. Tests + build
- `npm test`: **70/70 PASS** (9 files) — suite phủ: catalog (P03-T03), orders API security (P03-T01), router (P04-T01), booking funnel (P04-T02), shoe viewer (P04-T03), poster (P04-T04).
- `npm run build`: PASS (tsc strict `--noEmit` + vite).
- Canonical scripts: `agent_sync --check` OK, `context_audit` PASS.

### 4. E2E smoke
Môi trường codespace không có browser automation (không HAR/Lighthouse được). Thay bằng:
- Route smoke qua unit test `resolveRoute()` (5 case: `?page=order`, `/booking/`, `/`, fallback) — tương đương hành vi legacy.
- Build artifact smoke: `dist/` đầy đủ chunks; admin (AdminPage 0.29 kB) tách khỏi public shell.
→ PASS (static-level); HAR/Lighthouse chuyển thành technical debt (P00-T04).

### 5. Evidence completeness
| Task | Evidence | Status |
|---|---|---|
| P00-T01..T03 | `.agent/evidence/P00-*` | ✓ |
| P00-T04 | HAR/Lighthouse | **pending** (debt — không browser automation) |
| P01-T01, P02-T01 | research-log, implementation-plan | ✓ |
| P03-T01, P03-T03 | evidence dirs | ✓ |
| P04-T01..T04 | evidence dirs | ✓ |

### 6. Blockers
- **R-008 (P03-T02)**: RLS cutover cần Supabase policy export (`supabase db dump --schema public` hoặc dashboard) — chưa có access. Deferred; không mở rộng scope. API canary (P08-T01) bắt buộc kiểm tra RLS thủ công trước khi bật policy trong production.
- **R-009**: đã resolved (ADR-009 procedural).
- **Turnstile site-key**: wiring widget thật còn nợ cho release-candidate (P13 gate) — hiện dùng `local-demo-token` như legacy.

## Conclusion

Module quality gates: **PASS với 2 nợ kỹ thuật (R-008 + P00-T04)**. `implementation_gate` giữ `pending` vì P03-T02 chưa xong; không advance Bước 6 exit criteria khi R-008 còn open. Báo cáo chuyển tiếp: Bước 5 (agent coordination) hoàn thành các task code-allowed còn lại, Bước 6 audit đã chạy.

## Files changed

- Không code change trong task này (audit only). Evidence này + cập nhật STATE/CURRENT_TASK/SESSION_LOG.
