# P13-T01 — Deploy Cloudflare & Verify Production — Evidence

Task: `P13-T01` · Owner: `release-engineer` · Status: `done` · Date: 2026-08-03
Project: Cloudflare Pages `shoe3s` (account `e831569f603a59c71b3c5568e7f6dfa9`) · Production: **https://shoe3s.pages.dev** · Latest deploy: `3e62b729`

## Production deployment
- Project tạo Bước 13, production branch `main` — mọi push main deploy qua `wrangler pages deploy apps/web/dist --branch main`.
- Pages secrets (không commit): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Turnstile widget thật (P13)
- Site key `0x4AAAAAAEEz9KpFzEoqK8Y2` (public) + secret `0x4AAA...K1k` (Pages secret).
- `BookingWizard.tsx`: widget render explicit vào step 4, token state, disable submit khi thiếu token, reset sau lỗi.
- Legacy `index.html`/`js/app.js`: `.cf-turnstile` div + callbacks `onTurnstileToken`/`onTurnstileExpired`, chặn submit nếu chưa xác minh.
- **Xóa hoàn toàn `local-demo-token` fallback** (trước đó mọi đơn production sẽ bị BOT_CHECK_FAILED).

## Admin dashboard /admin/
- Legacy admin serve tại `/admin/` (Vite public copy): `apps/web/public/admin/{index.html,js/app.js,js/service-catalog.js,css/app.css}`.
- `js/app.js` trỏ production `vmakonkiotjkxlhpjwny` + publishable key `sb_publishable_WPMLea8mF...` (verify trong served file).

## Admin user (Auth)
- Tạo qua Admin API service_role: `ten11vip@gmail.com`, `app_metadata.role='admin'`, email confirmed.
- Verify: `signInWithPassword` → access_token OK; authenticated JWT SELECT orders → **200** (policy `orders_admin_select` + `is_admin()` SECURITY DEFINER); anon → **42501**.
- Lưu ý: đổi password sau lần dùng đầu (đã chia sẻ trong chat).

## Production verify snapshot
| Check | Result |
|---|---|
| GET https://shoe3s.pages.dev/ | 200 (React shell) |
| GET /admin/ | 200 |
| /admin/js/app.js trỏ production | có `vmakonkiotjkxlhpjwny` + publishable key |
| /admin/ có Turnstile widget | có sitekey + cf-turnstile |
| POST /api/orders token giả | 400 BOT_CHECK_FAILED |
| Canary POST + idempotency (Bước 13) | 200, không duplicate, DB đã cleanup |
| tests/build/typecheck/CI | 72/72, build OK, GH Actions green |

## Keys (ADR-012 — giữ tới completion)
- Legacy anon key đã lộ: giữ (RLS lockdown giới hạn anon → services public SELECT); revoke trong Dashboard sau completion.
- Legacy service_role key đã lộ trong chat: vẫn là `SUPABASE_SERVICE_ROLE_KEY` Pages secret — **rotate sau completion** (cập nhật 2 nơi: Supabase dashboard + Pages secret).

## Remaining (post-completion hoặc debt)
- Rotate keys (ADR-012) + revoke legacy anon.
- P00-T04: HAR/Lighthouse performance baseline (debt, không chặn).
- Custom domain (vd 3s.vn) + Pages custom domain config nếu owner muốn.
