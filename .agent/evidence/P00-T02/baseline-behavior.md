# P00-T02 Baseline Behavior and Route Inventory

## Source snapshot
- Imported from `Wed3s-main.zip` baseline archive.
- Imported files now present in repo:
  - `index.html`
  - `css/app.css`
  - `js/app.js`
  - `functions/api/telegram.js`
- No behavior changes were made during import.

## Public booking route
- Landing/booking experience is served when URL query contains `?page=order`.
- This route reveals the public booking funnel without exposing admin UI.
- Booking form collects:
  - `cus-phone`
  - `cus-name`
  - selected services
- Service pricing is computed entirely in `js/app.js` via a fixed `pricingMap`.
- Order payload is inserted directly into Supabase `orders` via `supabaseClient.from('orders').insert([orderData])`.
- Client-side order payload includes:
  - `customer_name`
  - `phone`
  - `services`
  - `total`
  - `status: 'Chờ thanh toán'`
  - `created_at` timestamp from client browser

## Admin route and flows
- Admin UI is on `/` if no `?page=order` query is present.
- Supabase auth session is checked on page load.
- If no session exists, login view is shown.
- Login uses Supabase `signInWithPassword` with email/password.
- After login, admin dashboard is displayed and data is fetched from:
  - `orders` table
  - `costs` table
- Admin actions include:
  - listing orders
  - completing orders (`status = 'Đã hoàn thành'`)
  - viewing bookings with status `Chờ thanh toán`
  - inserting cost records
  - charts and KPI summaries based on `orders`/`costs`

## Telegram and serverless API
- Notification path is handled by `functions/api/telegram.js`.
- Public client calls `/api/telegram` after successful order insert.
- The function reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from environment.
- It sends an HTML-formatted Telegram message with customer name, phone, services, total, and timestamp.

## Security observations
- `js/app.js` contains `SUPABASE_URL` and `SUPABASE_KEY` inline.
- Secret scanner flagged `js/app.js` because it contains a Supabase key.
- No Supabase service role key appears in imported browser source.
- Order pricing, status, and timestamp are computed/controlled client-side.
- The application currently lacks a server-side `/api/orders` endpoint; order writes occur directly from browser to Supabase.

## Runtime dependencies and environment
- Baseline uses CDN assets for:
  - Tailwind CSS
  - Chart.js
  - Font Awesome
  - Google Fonts
  - Supabase JS
  - SheetJS
- There is no `package.json` or lockfile in the imported baseline.
- The baseline appears built as a static HTML/JS app with a Cloudflare Function for Telegram.

## Baseline verification notes
- This file captures current route and behavior inventory for `P00-T02`.
- No attempt was made to fix or refactor existing workflows.
- Next task should be to validate runtime behavior with smoke tests and to audit Supabase/RLS/secret exposure.
