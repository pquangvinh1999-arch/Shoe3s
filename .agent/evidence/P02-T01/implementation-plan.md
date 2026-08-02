# P02-T01 Implementation Plan — Shoe3s 3D Booking Upgrade

Status: draft → approved. Sources: `.agent/evidence/P01-T01/research-log.md`, `docs/orchestrator/01-08`, `.agent/PLAN.json`.

## Context hiện tại (đã xác nhận bằng evidence)

- Baseline đã có: typed `serviceCatalog` (7 dịch vụ), Zod `orderRequestSchema`, legacy↔structured adapters, `functions/api/orders.js` scaffold, 16 unit tests PASS.
- Còn thiếu so với contract an toàn: Turnstile server-side verify, idempotency enforcement, rate limit, Telegram escape, error envelope chuẩn.
- Admin vẫn dùng Supabase direct + innerHTML (giữ nguyên trong phase này).
- Public booking `submitOrder` đã fetch `/api/orders` nhưng turnstile token fallback `'local-demo-token'`.
- POS `activePaymentServices` vẫn hard-code 7 dịch vụ (duplicate catalog — cần adapter).
- CDN unpinned (Tailwind CDN, sheetjs) — đổi trong phase frontend, không đổi behavior ở phase này.
- Route `/?page=order` và `/` là compatibility bắt buộc.

## Nguyên tắc (từ MASTER_CONTEXT §13, docs/06)

- Strangler migration, mỗi phase deployable/rollbackable.
- Secure data path (P03) trước visual (P04+). ADR-002.
- Server là nguồn sự thật cho `total`/`status`/`created_at` (R-001).
- Không đổi schema/status text giai đoạn chuyển đổi (ADR-005).
- Không thêm thư viện nếu chưa ghi rationale/license/bundle cost (rule 6).
- Không deploy production trước Step 13 gate.

## Modules & dependencies (theo .agent/PLAN.json)

```text
P03-T01 Secure order API (hoàn thiện scaffold)         [code_allowed]
  ├─ Turnstile server-side verify (env TURNSTILE_SECRET_KEY)
  ├─ Idempotency: payload-hash + unique key → trả order cũ / conflict
  ├─ Rate limit theo IP hash (không lưu raw IP)
  ├─ Error envelope chuẩn {ok,code,message,request_id}
  ├─ Telegram notify an toàn (escape HTML) sau insert OK, không rollback nếu lỗi
  └─ Body size limit + generic errors
  ↓
P03-T02 Supabase RLS cutover (template 001/002)         [code_allowed]
  ├─ Policy export hiện tại (blocker: cần Supabase CLI/upstream)
  ├─ RLS enable cho orders/costs, anon read-only? (tuỳ evidence export)
  ├─ Lockdown anonymous insert chỉ sau canary API ổn
  └─ Negative tests: anon/authenticated/non-admin/admin
  ↓
P03-T03 Service catalog + POS compatibility adapter      [code_allowed]
  ├─ POS `activePaymentServices` → sinh từ `serviceCatalog`
  ├─ Custom service POS (giá thỏa thuận) giữ nguyên
  └─ Không đổi label/total/status hiện tại
  ↓
P04-T01 React/Vite/TS shell + route split               [code_allowed]
  ├─ Vite + TS strict, workspaces apps/web
  ├─ Router adapter giữ `?page=order` + `/` + `/booking/` alias (redirect sau analytics check)
  ├─ Lazy chunk: public shell tách admin/chart/xlsx/3D
  └─ ADR-007 spike: validate build/deploy với Cloudflare Pages trước full migration
  ↓
P04-T02 Design system + booking funnel                   [code_allowed]
  ├─ Tokens theo MASTER_CONTEXT §6 (ink-950, navy-800, cyan-500, copper-500…)
  ├─ Booking wizard: chọn dịch vụ → thông tin → nhận/trả → review → turnstile → submit → success
  ├─ a11y: keyboard, focus, 44px touch, prefers-reduced-motion
  └─ Form giữ dữ liệu, error recovery, retry an toàn (idempotency key)
  ↓
P04-T03 Adaptive 3D dirty-to-clean scene                 [code_allowed]
  ├─ GLB licensed (chưa có asset — cần tạo/tìm license rõ ràng)
  ├─ Shader uCleanProgress + dirty mask texture
  ├─ Tiers Low/Med/High theo docs/05 (triangles, DPR, draw calls)
  └─ Lazy load, frameloop demand, pause hidden/offscreen
  ↓
P04-T04 2D/reduced-motion/device fallbacks               [code_allowed]
  ├─ Tier 0: poster AVIF/WebP + CSS before/after slider (bắt buộc pass E2E)
  ├─ save-data, reduced-motion, WebGL context lost recovery
  └─ Hero poster budget ≤180KB mobile
  ↓
P05-T01 Module quality gates + remediation               [code_allowed]
  └─ lint/typecheck/unit/E2E/axe/Lighthouse budget per module

P06-T01 Report → P07-T01 iterative QA → P08 review → P09 consensus → P10 remediation → P11 CI → P12 release candidate → P13 deploy.
```

## Dependencies

| Task | Depends on | Blocker ngoài repo |
|---|---|---|
| P03-T01 | P02-T01 | cần `TURNSTILE_SECRET_KEY` + `SUPABASE_SERVICE_ROLE_KEY` trong env Cloudflare (test local dùng `.dev.vars`) |
| P03-T02 | P03-T01 | **Supabase policy export** (blocker đã ghi nhận từ P00-T03) |
| P03-T03 | P03-T01 | — |
| P04-T01 | P03-T03 | ADR-007 spike evidence |
| P04-T02 | P04-T01 | — |
| P04-T03 | P04-T01, P04-T02 | **licensed 3D asset** (chưa có) |
| P04-T04 | P04-T03 | — |
| P05-T01 | P03-T02, P04-T04 | — |

## Acceptance tests (per module)

- **P03-T01**: vitest cho validate/price/idempotency/phone; Playwright hoặc curl test: POST hợp lệ → 200 + `ok:true`; thiếu turnstile → `BOT_CHECK_FAILED`; sai payload → `VALIDATION_ERROR`; retry cùng key+payload → cùng order; cùng key khác payload → conflict; lỗi supabase → `INTERNAL_ERROR` không lộ text.
- **P03-T02**: RLS negative tests anon insert bị chặn sau lockdown; admin flow E2E vẫn pass; rollback script test.
- **P03-T03**: POS tổng tiền/label bằng catalog; custom service vẫn hoạt động.
- **P04-T01**: `?page=order` và `/` render đúng; booking bundle không chứa admin/chart/xlsx/3D.
- **P04-T02**: booking happy path E2E; keyboard-only hoàn tất wizard; form retry không tạo đơn trùng.
- **P04-T03**: scene render cả 3 tiers; pause khi tab hidden; context lost recovery.
- **P04-T04**: Tier 0 E2E đầy đủ không WebGL; poster hiển thị; save-data không load canvas.

## Risks & rollback (ghi nối tiếp RISKS.md)

- R-001 (Critical): chỉ hết sau P03-T01 + P03-T02 lockdown; rollback: giữ anon insert mở tới khi canary 24h.
- R-005 (Critical): E2E compatibility + feature flags `BOOKING_3D_ENABLED`, `SECURE_ORDER_API_REQUIRED`; rollback: redirect về static landing cũ (giữ nguyên cho tới P05 stable).
- R-002 (High): React text rendering + escape Telegram; rollback: giữ CSS fallback.
- R-003 (High): 3D lazy + Tier 0 first-class; rollback: tắt 3D bằng flag.
- Blocker mới: R-008 Supabase policy export (P03-T02) — cần upstream/Supabase CLI; R-009 licensed 3D asset chưa có.
- Mỗi module commit riêng, không trộn refactor với behavior change; rollback = revert commit (docs/06).

## Rollback rehearsal

- Tag/commit trước mỗi change (checkpoint script).
- Migration SQL dạng idempotent, không drop destructive trong window.
- Preview deploy per PR; canary trên `main` sau Step 12; production chỉ sau Step 13 gate.

## Decisions needed

1. Turnstile site key/secret — có sẵn hay cần tạo? (test local dùng demo token nhưng API phải verify ở prod)
2. Supabase policy export — ai có quyền truy cập dashboard/CLI?
3. 3D asset — tìm GLB license rõ ràng hay dựng procedural? (ảnh hưởng P04-T03)

## Next action

Approve plan_gate → P03-T01: hoàn thiện `functions/api/orders.js` (Turnstile, idempotency, rate limit, error envelope, Telegram escape) + tests.
