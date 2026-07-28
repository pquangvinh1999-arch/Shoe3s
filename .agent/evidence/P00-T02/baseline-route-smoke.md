# P00-T02 Baseline Route Smoke Test

## Smoke test commands
- Started a local static server from repository root:
  - `python3 -m http.server 8000`
- Verified baseline routes:
  - `http://127.0.0.1:8000/` → HTTP 200
  - `http://127.0.0.1:8000/?page=order` → HTTP 200

## Results
- Both the public landing route and booking route are accessible.
- The admin entry at root is not shown when `?page=order` is present.
- The booking route exposes the landing booking funnel without admin UI.

## Notes
- The static server validates route delivery only; it does not execute Cloudflare Functions.
- The Telegram notification path is implemented in source as `functions/api/telegram.js`, but `/api/telegram` cannot be verified by this simple static server.
- This smoke test confirms the imported baseline source is available and the public route gate is preserved.
