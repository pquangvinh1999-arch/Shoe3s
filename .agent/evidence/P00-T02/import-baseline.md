# P00-T02 Baseline Import Evidence

## Imported baseline source
- Source imported from `Wed3s-main.zip` in repository root.
- Baseline archive commit identifier: `071ae03b7a4bcb8508217d1bdbe312ae86d8ecbd`.
- Imported files:
  - `index.html`
  - `css/app.css`
  - `js/app.js`
  - `functions/api/telegram.js`

## Notes
- The baseline application now exists in the repo with expected file paths.
- `js/app.js` contains inline Supabase configuration and was flagged by the secret scanner.
- The application uses CDN-hosted libraries: Tailwind, Chart.js, FontAwesome, Google Fonts, Supabase JS, and SheetJS.
- There is no package manager manifest in the imported baseline.
- This import is intentionally a source snapshot only; no behavior changes were made.

## Next steps
- Audit current routes, booking/admin/QR/invoice flows for baseline behavior.
- Run secret and RLS audits before any implementation changes.
- Keep this evidence file with the active P00-T02 task.
