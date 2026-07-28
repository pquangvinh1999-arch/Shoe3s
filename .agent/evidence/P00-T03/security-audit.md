# P00-T03 Security, RLS and Secret Audit

## Task state
- Active task: `P00-T03`
- Goal: Audit and approve project context without changing behavior.
- No source behavior changes made in this file.

## Secret exposure findings
- `js/app.js` contains visible public Supabase client configuration:
  - `SUPABASE_URL = 'https://agcvsogtqxoqlhcubghy.supabase.co'`
  - `SUPABASE_KEY = 'eyJhbGci...XUj04'`
- That key is embedded in browser-side code and is therefore exposed to any visitor.
- `functions/api/telegram.js` uses environment-based secrets correctly:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
- No actual secret values are present in repo environment files.
- No `.env*` or local secret file was found in repository root or child folders.

## Environment variable inventory
- From `orchestrator/templates/env/.env.example`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_TURNSTILE_SITE_KEY`
  - `VITE_BOOKING_3D_ENABLED`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
  - `TURNSTILE_SECRET_KEY`
  - `ALLOWED_ORIGIN`
  - `ORDER_NOTIFICATION_TIMEOUT_MS`
- These names correspond to expected Cloudflare and client configuration for the project.

## RLS and architecture findings
- Current baseline client-side flow writes directly to Supabase `orders` using anon/JS key.
- `js/app.js` creates `supabaseClient` with publishable key and performs:
  - insert into `orders`
  - select from `orders`
  - select from `costs`
  - update `orders` and `costs`
- There is no server-side `/api/orders` endpoint in the imported baseline.
- Current backend function only handles Telegram notification, not order creation.
- This means the Supabase anon key is currently both a write and auth boundary for public booking.

## Live Supabase policy evidence
- The public anon key from `js/app.js` was used to query the Supabase REST API.
- `GET /rest/v1/orders?select=*&limit=1` → `200 OK`, returned `[]`
- `GET /rest/v1/costs?select=*&limit=1` → `200 OK`, returned `[]`
- `POST /rest/v1/orders` with browser-style payload → `201 Created`
- This proves the current runtime allows anonymous insert to `orders` and anonymous read access to `orders` and `costs`.
- It also proves there is no repo-local Supabase policy export available for full policy reconstruction.

## XSS / payload safety findings
- `functions/api/telegram.js` formats HTML text for Telegram using interpolated values.
- Current function does not escape `customer_name`, `phone`, or `services` before placing them into HTML payload.
- Client-side admin UI uses `innerHTML` in multiple places, including order lists and dashboards; this is a risk with untrusted DB strings.

## Git history audit
- `git log --all -S 'SUPABASE_KEY\|TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID\|TURNSTILE_SECRET_KEY'` returned no matches in history.
- No evidence of the env secret names being committed with values in git history from current repository state.

## Risk summary
1. Critical: direct client-side Supabase writes and client-side price/status calculation.
2. High: exposed public key in browser code, with no server-side order validation.
3. Medium: Telegram HTML payload is built without escaping.
4. Medium: admin UI uses `innerHTML` for rendered database content.

## Required next work for P00-T03
- Inspect Supabase schemas and policies for `orders`, `costs` and admin authorization.
- Verify whether anonymous direct write is currently allowed and whether RLS is in place.
- Confirm `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are only configured as secrets, not committed.
- Build a prioritized findings list and recommend server-side order API / RLS lockdown sequence.

## P01-T01 service catalog extraction
- Current service catalog is implemented in `js/app.js` using a fixed `pricingMap` object and a duplicated `activePaymentServices` list.
- Services present in the baseline:
  - `Vệ sinh toàn diện` — 69,000 VND
  - `Xử lý keo` — 139,000 VND
  - `Khâu đế` — 99,000 VND
  - `Tẩy ố vàng đế` — 139,000 VND
  - `Dán Sole` — 0 VND
  - `Thay đế, đắp đế cầu lông, bóng rổ, bóng chuyền` — 0 VND
  - `Vệ sinh túi sách, Balo` — 0 VND
- No canonical service IDs exist; P01-T01 should create stable IDs and centralize price logic.
