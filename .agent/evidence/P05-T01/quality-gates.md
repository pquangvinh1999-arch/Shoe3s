# P05-T01 — Module Quality Gates — Evidence

Task: `P05-T01` · Owner: `test-engineer` · Status: `active (audit re-run 2026-08-03; exit blocked by R-008)` · Date: 2026-08-02 (re-run 2026-08-03)

## Remediation (2026-08-03) — catalog sync ADR-010/011

Commit `c8f408a` đã sync `js/service-catalog.js` về production DB (4 services: CLEAN_STANDARD 90K, CLEAN_PREMIUM 150K, REPAIR_SOLE 200K, PROTECT_NANO 80K), nhưng 3 file test + `index.html` legacy còn giữ catalog 7 services cũ → **14 test fail (56/70)** bị audit bắt được:

- `tests/p03-t01.secure-order-api.test.ts`: `VALID_PAYLOAD.service_ids` dùng `service-cleaning`/`service-sole-stitch` (không còn tồn tại) → schema reject VALIDATION_ERROR; quote/total/services string cập nhật theo giá mới (290000; CLEAN_STANDARD + REPAIR_SOLE).
- `tests/p03-t03.pos-service-catalog.test.ts`: names/prices/total 520000; không còn zero-priced nên `c: true` = `[]`.
- `tests/p01-T02.order-schema.test.ts`: total 168000 → 290000 (giá mới).
- `tests/p01-t01.service-catalog.test.ts`: `toContainEqual` thiếu field `description`.
- `tests/p01-t01.service-catalog.spec.ts` (E2E) + `index.html`: legacy UI vẫn hiển thị 7 service cũ → `getServiceByName()` trả null → `service_ids = []` → checkout legacy sẽ fail. Đã sync 4 service cards mới với catalog.

Kết quả re-run: **70/70 PASS**, build PASS (shell 61.61KB / 3D 131.44KB gzip — budget ✓).

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

- Remediation (2026-08-03): `tests/p03-t01.secure-order-api.test.ts`, `tests/p03-t03.pos-service-catalog.test.ts`, `tests/p01-T02.order-schema.test.ts`, `tests/p01-t01.service-catalog.test.ts`, `tests/p01-t01.service-catalog.spec.ts`, `index.html` (service cards legacy sync 4 services).
- Evidence này + cập nhật STATE/CURRENT_TASK/SESSION_LOG/DECISIONS (ADR-011).
