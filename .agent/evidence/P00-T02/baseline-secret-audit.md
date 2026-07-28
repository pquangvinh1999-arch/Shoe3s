# P00-T02 Baseline Secret Audit

## Secret scan results
- `js/app.js` contains inline Supabase configuration:
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
- This file was flagged by `scripts/secret_scan.py --changed`.
- The baseline browser source does not contain a Supabase service role key.

## Environment and token handling
- `functions/api/telegram.js` uses `env.TELEGRAM_BOT_TOKEN` and `env.TELEGRAM_CHAT_ID`.
- Telegram token is not hard-coded in the imported serverless function source.
- The baseline source indicates a design goal of hiding Telegram secrets behind a serverless API.

## Findings
- The public booking flow currently writes orders directly from browser to Supabase, making the client-side key and payload trust boundary critical.
- Client-side pricing, order status, and created timestamp are controlled by the browser.
- A server-side order API is needed to protect pricing, status, and idempotency.
- The existing `/api/telegram` function is a reasonable secret boundary for Telegram notifications, but it lacks payload validation.

## Recommendation for next task
- Continue to `P00-T03` with a security and RLS audit.
- Verify Supabase table policies for `orders`, `costs`, and admin access.
- Confirm that no sensitive values are committed beyond this baseline evidence.
