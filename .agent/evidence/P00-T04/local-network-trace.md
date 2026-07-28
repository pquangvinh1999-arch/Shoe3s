# P00-T04 Local Network Trace

## Captured endpoints
- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/?page=order`

## Page load summary
- Both endpoints returned `200 OK` from the local Python preview server.
- The content served is the imported static HTML/CSS/JS baseline.

## Local asset fetch results
- `js/app.js` → `200 OK`, `text/javascript`, 45,985 bytes
- `css/app.css` → `200 OK`, `text/css`, 4,078 bytes
- `logo.png` → `404 Not Found` (requested three times from page markup)

## Missing local runtime assets
- `logo.png` is referenced from `index.html` and fails to load.
- `Pic1.png` .. `Pic6.png` are referenced in `js/app.js` slideshow logic and are not present in the workspace.
- `Pic5.png` / `Pic6.png` do not appear inside `Wed3s-main.zip`, so the imported baseline snapshot is incomplete for these slideshow assets.

## Remote dependency resolution
- The baseline uses these external CDN dependencies:
  - `https://cdn.tailwindcss.com`
  - `https://cdn.jsdelivr.net/npm/chart.js`
  - `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
  - `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=400;500;600;700;800&display=swap`

## Remote asset metadata notes
- Chart.js usage is MIT-licensed.
- Supabase JS usage is MIT-licensed.
- SheetJS (xlsx) is Apache-2.0 licensed.
- Font Awesome Free is provided under a mixed license: icons CC BY 4.0, fonts SIL OFL 1.1, and code MIT.
- Google Fonts should be treated under the Google Fonts terms, with Plus Jakarta Sans typically licensed under SIL OFL.

## Observations
- The local preview is functional for static HTML, CSS, and JS, but the interface is broken by missing local images.
- A full HAR capture is not available in this environment because browser automation tools were not installed.
- This file documents the network trace-like evidence that is available from the local HTTP server and repo inspection.
