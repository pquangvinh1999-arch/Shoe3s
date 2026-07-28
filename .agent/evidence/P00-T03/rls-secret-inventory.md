# P00-T03 RLS and Secret Inventory

## Repository secret audit
- Full repo secret scan (`scripts/secret_scan.py --non-blocking`) returned one flagged file:
  - `js/app.js`
- No `.env*` or local secret file exists in the repository tree.
- Git history search for secret-related key patterns returned no matches:
  - `SUPABASE_KEY`
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
  - `TURNSTILE_SECRET_KEY`

## Environment variables observed
- `orchestrator/templates/env/.env.example` defines expected variables:
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
- This confirms the project intends to keep service secrets out of source and to use public env vars only for browser/published config.

## Browser-side Supabase exposure
- `js/app.js` contains a hard-coded Supabase URL and key:
  - `SUPABASE_URL = 'https://agcvsogtqxoqlhcubghy.supabase.co'`
  - `SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
- The baseline source also imports `@supabase/supabase-js@2` from CDN.
- This key is in browser JS, so it is necessarily exposed to client users.

## Serverless secret usage
- `functions/api/telegram.js` uses environment values rather than hard-coding them:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`
- No actual Telegram secret values are present in repo source.

## RLS/schema evidence
- No Supabase policy or SQL migration file is present in the current repository except template placeholders under `orchestrator/templates/supabase/`.
- The imported baseline source has no `/api/orders` endpoint; it performs direct writes to Supabase from browser code.
- `js/app.js` accesses Supabase tables directly for both public booking and admin flows:
  - `orders.insert([orderData])`
  - `orders.select('*')`
  - `costs.select('*')`
  - `orders.update(...)`
  - `costs.insert(...)`
- Live REST evidence from the repo anon key is recorded in `.agent/evidence/P00-T03/supabase-policy-evidence.md`.
- This means current repository evidence is sufficient to prove the runtime policy state for public anon access, but not to reconstruct complete policy files.

## Live Supabase policy evidence
- The public anon key from `js/app.js` was used to query the Supabase REST API.
- `GET /rest/v1/orders?select=*&limit=1` → `200 OK`, returned `[]`
- `GET /rest/v1/costs?select=*&limit=1` → `200 OK`, returned `[]`
- `POST /rest/v1/orders` with browser-style payload → `201 Created`
- This proves the current runtime allows anonymous insert to `orders` and anonymous read access to `orders` and `costs`.
- This also proves the repo lacks on-disk Supabase policy/schema files for full policy audit.

## XSS and payload risk evidence
- `functions/api/telegram.js` interpolates received order fields into HTML body without escaping.
- `js/app.js` uses `innerHTML` in admin rendering for order lists, bookings, costs, previews, and other UI fragments.
- These patterns create stored-XSS risk when database content or client-provided strings are rendered.

## Findings summary
- Critical issue: public booking flow currently depends on browser-side Supabase key and client-side order payload trust.
- High issue: no evidence of Supabase schema/policy files in repo; actual RLS status must be validated externally.
- Medium issue: Telegram HTML payload and admin `innerHTML` usage need escaping or safe rendering.

## Recommended next actions
1. Obtain Supabase project schema/policy export or use Supabase CLI to inspect `orders`/`costs` policies.
2. Confirm whether anonymous write to `orders` and `costs` is currently allowed.
3. If allowed, plan `/api/orders` cutover before revoking anonymous insert.
4. Add RLS policy evidence for public/anon/admin/service roles.
5. Refine threat model with these factual findings.
