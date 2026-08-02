# P01-T01 Research Log — Repo, Docs, Best Practices

Status: complete. Sources read and verified in this session (2026-08-02).

## Sources reviewed

### Canonical context
- `AGENTS.md`, `.agent/MASTER_CONTEXT.md`, `.agent/PLAN.json`, `.agent/state/*`
- `orchestrator/CONTEXT.md`, `orchestrator/TASKS.json`, `orchestrator/PLAN.md`, `orchestrator/DECISIONS.md`

### Docs (`docs/orchestrator/`)
- `00_REPO_REVIEW.md` — static review của baseline gốc; R1–R6.
- `01_TARGET_ARCHITECTURE.md` — strangler migration, workspace/apps, route/data compatibility.
- `02_3D_UX_SPEC.md` — 4 tiers progressive enhancement, dirty→clean shader, booking wizard.
- `03_SECURITY.md` — threat model, secure order path 10 bước, RLS rollout thứ tự, XSS/headers/secrets.
- `04_DATA_API_CONTRACTS.md` — `Service` type, order state machine, POST /api/orders contract, idempotency, error envelope.
- `05_PERFORMANCE_BUDGET.md` — LCP ≤ 2.5s, bundle budgets, scene tiers, downgrade triggers.
- `06_MIGRATION_PLAN.md` — P00→P09 phase order, rollback requirements.
- `07_LIBRARY_SKILL_MATRIX.md` — three/R3F/drei/GSAP/zustand/zod/RHF/supabase-js; asset pipeline; quality tools.
- `08_DECISION_RECORDS.md` — ADR-001..007 accepted; ADR-007 proposed (React spike).

### Application code (baseline đã import, commit `0a862ff`)
- `index.html` — 27 KB; CDN unpinned: Tailwind CDN, chart.js, font-awesome, google fonts, supabase-js@2, sheetjs. Scripts: `js/service-catalog.js` (module), `js/order-schema.js` (module), `js/app.js` (defer).
- `js/app.js` (876 dòng) — routing `?page=order` / admin; landing slideshow `Pic1..6.png`; booking submit qua `fetch('/api/orders')`; admin: dashboard/orders/bookings/finance/CRM/POS/VietQR/print 58mm; admin vẫn dùng `supabaseClient` trực tiếp (đúng thiết kế: admin giữ direct, public chuyển API).
- `js/service-catalog.js` — typed catalog 7 dịch vụ, stable IDs, `pricingMode`/`priceVnd`/`active`/`sortOrder`/`visualTarget`; helpers `resolveSelectedItems`, `calculateTotal`, `selectedNamesToLegacyServices`.
- `js/order-schema.js` — Zod `orderRequestSchema` (customer_name 2..80, phone VN normalize → `84xxxxxxxxx`, service_ids 1..10 phải tồn tại trong catalog, pickup_address ≤240, note ≤500, turnstile_token, idempotency_key UUID); `ORDER_STATUS` constants; legacy↔structured adapters (`parseLegacyServiceItem`, `legacyServicesToStructuredItems`, `serviceIdsToStructuredItems`, `serviceIdsToLegacyServices`, `buildLegacyOrderData`).
- `functions/api/orders.js` — `onRequestPost`: validate JSON → Zod parse → `buildLegacyOrderData` → insert Supabase qua `SUPABASE_SERVICE_ROLE_KEY` (server-side) → response `{ok, order_id, status, quote}`. **Gaps:** chưa verify Turnstile server-side, chưa enforce idempotency (chỉ lưu key), chưa rate limit, chưa gọi Telegram, lỗi Supabase trả `INTERNAL_ERROR` kèm body text.
- `functions/api/telegram.js` — env-based token/chatId đúng; **XSS:** không escape `customer_name`/`phone`/`services`/`total` khi ghép HTML `parse_mode=HTML`; trả `err.message` về client.
- `tests/` — 3 files, 16 tests PASS (`npm test`).

## Findings so với evidence cũ (P00-T03)
1. **`pricingMap` không còn tồn tại** — evidence P00-T03 mô tả baseline cũ; commit `0a862ff` đã scaffold P01 (typed catalog + order schema) và P02-T01 (orders API + fetch trong `submitOrder`). Duplicate còn lại: `activePaymentServices` trong `js/app.js` (POS) vẫn hard-code 7 dịch vụ thay vì dùng `serviceCatalog`.
2. **Đã có `/api/orders`** — trái với evidence P00-T03 "no server-side /api/orders endpoint"; nhưng chưa đủ an toàn (Turnstile/idempotency/rate-limit/Telegram còn thiếu).
3. **Đã có `package.json` + vitest + zod** — trái với P00-T04 "no package manager manifest"; tests chạy được sau `npm install`.
4. **XSS telegram chưa sửa** — đúng như evidence, vẫn còn.
5. **CDN unpinned vẫn nguyên** — Tailwind CDN ở production target vi phạm rule; giữ nguyên để không đổi hành vi, ghi vào plan.
6. **Admin vẫn dùng direct Supabase + innerHTML** — đúng như evidence; admin giữ nguyên trong migration phase.

## Best practices ghi nhận (từ docs + framework)
- Strangler migration: không big-bang; mỗi phase deployable/rollbackable.
- Secure path trước visual: P02 (API) trước P05 (3D booking UX); ADR-002.
- Server là nguồn sự thật về price/status/created_at; RLS lockdown chỉ sau cutover (001→002 templates).
- 3D = progressive enhancement: Tier 0 poster/CSS bắt buộc pass E2E; canvas lazy, `frameloop="demand"`, pause khi hidden, adaptive DPR.
- XSS: không `innerHTML` với DB data, React text rendering, escape Telegram HTML, CSP chặt, tự host/pin dependency.
- Idempotency: key + payload hash; cùng key khác payload → conflict; không rollback order vì Telegram lỗi.
- Performance budgets là gate; không tăng budget chỉ để build xanh.
- License: không dùng asset/CDN không rõ license; pin version + lockfile.

## Options / quyết định research
- Catalog/schema hiện có đạt ADR-004/ADR-005 (typed + keep legacy strings) — dùng làm base, không viết lại.
- Orders API scaffold giữ lại, hoàn thiện theo `04_DATA_API_CONTRACTS.md` + `03_SECURITY.md` (Turnstile verify, idempotency constraint, rate limit, escape Telegram, error envelope chuẩn `{ok:false,code,message,request_id}`).
- Route `?page=order` + `/` giữ nguyên; React shell (P04-T01) đi sau API an toàn (ADR-002).
- P00-T04 asset inventory: cần cập nhật `asset_manifest.md` vì đã có package.json/node_modules; HAR/Lighthouse chưa có — môi trường không có browser automation.

## Evidence trạng thái
- `service-catalog-extraction.md` — đã tồn tại, khớp catalog thực tế (7 dịch vụ), cập nhật note về pricingMap đã hết.
- `migration-plan.md` (P01-T01-p01-T02) — tham khảo cho planning P02.
- `p01-t02-schema-adapters.md` — adapter schema đã được test (16 pass).
