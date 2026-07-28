# P00-T03 Findings and Priority List

## Key findings from current baseline
1. Direct browser writes to Supabase `orders` are active in current baseline.
   - `js/app.js` inserts `orderData` with `total`, `status`, and `created_at` from client-side logic.
   - Public booking uses a browser-visible Supabase key, so safe behavior depends entirely on RLS.

2. No repo evidence of actual Supabase RLS policies.
   - The repository contains only RLS migration templates under `orchestrator/templates/supabase/`.
   - No live policy exports, SQL migration history, or Supabase config files were found.

3. Missing server-side booking API in baseline.
   - `functions/api/telegram.js` exists, but there is no `/api/orders` endpoint.
   - A secure cutover requires server-side order creation before any anonymous RLS lockdown.

4. Telegram secret handling is generally correct but payload is unsafe.
   - `functions/api/telegram.js` reads `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` from env.
   - The function interpolates user-provided order fields into HTML without escaping.

5. Stored XSS / unsafe rendering risk in admin UI.
   - Admin/dashboard code uses `innerHTML` to render orders, bookings, costs, and previews.
   - Untrusted DB values should be rendered safely or escaped.

6. Duplicate service pricing and status logic.
   - Fixed pricing appears in `pricingMap` and multiple service UI paths.
   - This creates risk of mismatch when migrating to typed catalog and API pricing.

## Priority list
1. Highest: validate live Supabase policy state for `orders` and `costs`.
   - Confirm whether anonymous insert/update is currently permitted.
   - Capture evidence of policy matrix and any existing RLS.

2. High: verify whether the published Supabase key is truly safe.
   - If anonymous write is allowed, it must remain until secure API cutover.
   - If anonymous write is blocked, confirm admin and service permissions instead.

3. High: document server-side `/api/orders` design and required cutover sequence.
   - `P02-T01` needs secure order API, validation, pricing, idempotency.
   - `P02-T04` needs staged RLS lockdown after canary.

4. Medium: record XSS and HTML injection risks in Telegram and admin rendering.
   - Add concrete examples from `functions/api/telegram.js` and `js/app.js`.

5. Medium: capture the current service/catalog duplication scope.
   - Extract service names and prices from code for P01-T01.
   - Document compatibility risk from legacy `services` strings.

6. Lower: collect baseline asset/performance inventory.
   - This supports P00-T04 and can run in parallel with security review.
   - Do not conflate asset checks with RLS/secret gating.

## Requirements to move to P00-T04
- Complete the current P00-T03 security/RLS audit or at least document the security risks clearly.
- Have a baseline asset inventory plan for:
  - images, icons, fonts, GLB/textures references
  - CDN/remote URL usage
  - duplicate/missing assets and license sources
- Keep behavior unchanged while measuring the current static bundle and network footprint.
- P00-T04 depends only on P00-T01, but ideally start after P00-T02 baseline behavior is recorded.

## Requirements to move to P01-T01
- Baseline booking/admin behavior must be documented (`P00-T02` evidence complete).
- Security and secret exposure must be understood enough to avoid migrating unsafe pricing/order logic.
- Read `docs/orchestrator/04_DATA_API_CONTRACTS.md` and extract current service catalog from code.
- Prepare a stable service catalog with IDs, names, prices, and active flags.
- Ensure no current authoritative price map is duplicated across booking/POS logic.

## Recommended next step
- Finish P00-T03 by collecting or requesting actual Supabase policy evidence.
- Then start P00-T04 asset/performance inventory in parallel if desired.
- Once baseline behavior and security are documented, P01-T01 can begin with typed catalog extraction.
