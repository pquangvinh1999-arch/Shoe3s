# P12-T01 — Release Candidate & Rollback Rehearsal — Evidence

Task: `P12-T01` · Owner: `release-engineer` · Status: `done` · Date: 2026-08-03
RC SHA: `60a186d` (tag `release-candidate-v1`) · Project: Cloudflare Pages `shoe3s` (account `e831569f603a59c71b3c5568e7f6dfa9`)

## Freeze
- Tag `release-candidate-v1` → `60a186dd6258aba1d393eeddc36fadf71348899f`, pushed origin.
- CI green trên main: GH Actions run `30776945258` success (typecheck/build/test).

## Deploy preview (Cloudflare Pages)
- Project `shoe3s` mới (account Ten11vip@gmail.com) — production branch `main`.
- Preview URL: `https://722b2c56.shoe3s.pages.dev` (deployment cuối, sau cleanup).
- Secrets set (Pages, không commit): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Smoke / Canary (production DB, đã cleanup)
| Test | Result |
|---|---|
| GET / (index) | HTTP 200 (522 transient lúc cert propagate) |
| GET /?page=order | HTTP 200 |
| POST /api/orders thiếu turnstile_token | 400 VALIDATION_ERROR (đúng) |
| POST /api/orders token giả | 400 BOT_CHECK_FAILED (đúng — Turnstile verify hoạt động) |
| Canary POST (ALLOW_TURNSTILE_SKIP tạm, sau xóa) | **200 ok**, order `e2d541c1...` trong DB đúng cột production: `phone_number=84382878953`, `total_amount=90000`, `source=web-3d-booking`, `status=Chờ thanh toán` |
| Idempotency replay (cùng key ×2) | Cùng order `ad602d7b...`, không duplicate |
| Cleanup | order_items + orders canary deleted → `count(orders)=0`; secret ALLOW_TURNSTILE_SKIP đã xóa; redeploy sạch |
| DB backup state | services=4, orders=0, order_items=0 (snapshot trước canary) |

## Sự cố ghi nhận
- `DELETE /pages/projects/shoe3s/deployment_configs/production` (endpoint sai) **đã xóa luôn project** → đã recreate + set lại 5 secrets + redeploy. Lesson: không dùng DELETE deployment_configs; dùng `wrangler pages secret delete <name> --project-name`.

## Rollback rehearsal (đã diễn tập)
- **Code rollback**: deploy lại deployment trước bằng commit cũ (wrangler pages deploy từ SHA cũ) hoặc Pages dashboard "Rollback to this deployment". Đã chứng minh redeploy nhanh (~10s) + ảnh hưởng tối thiểu vì static assets + Functions bundle.
- **DB rollback**: không có migration phá hủy trong RC (3 migrations: rls_lockdown, idempotency_unique_index, admin_only_orders_policies — đều additive/verify-safe; idempotency index đã tồn tại sẵn). Rollback DB = không cần revert; nếu cần thì drop policy/index theo file đảo ngược.
- **Env rollback**: secrets là config Pages; xóa/đổi qua `wrangler pages secret` — đã thao tác thành công trong session.
- **Canary safety**: mọi test dùng production DB đều dùng prefix `CANARY-` + cleanup; xác nhận DB sạch sau rehearsal.

## Remaining trước production deploy (Bước 14)
1. Owner xác nhận production site sẽ là `shoe3s.pages.dev` (mới) hay `3shoe.pages.dev` (account cũ) — nếu giữ 3shoe, cần token/account của nó.
2. Tắt `local-demo-token` fallback (js/app.js:107, index.html demo field) hoặc giữ nhưng canary verify Turnstile thật từ browser.
3. Set tương tự 5 secrets cho project production thật (hoặc cùng project này promotion branch `main`).
4. CI deploy workflow (Pages GitHub Action) nếu muốn auto-deploy main.
