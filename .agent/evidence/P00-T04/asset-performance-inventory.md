# P00-T04 Asset and Performance Inventory

## Baseline asset inventory
- Local runtime files:
  - `index.html` — 27,278 bytes
  - `css/app.css` — 4,078 bytes
  - `js/app.js` — 45,985 bytes
- No local `logo.png` or `Pic*.png` assets were present in repository root or child folders.
- No local 3D/model assets (`.glb`, `.gltf`) were found in the current baseline.
- No package manager manifest (`package.json`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`) exists in the imported baseline.

## Asset references and status
- Referenced local assets in runtime code:
  - `logo.png` — missing
  - `Pic1.png` .. `Pic6.png` — missing
- Local CSS and JS references:
  - `css/app.css`
  - `js/app.js`
- Remote CDN/runtime dependencies:
  - `https://cdn.tailwindcss.com`
  - `https://cdn.jsdelivr.net/npm/chart.js`
  - `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
  - `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=400;500;600;700;800&display=swap`

## Missing runtime assets
- `logo.png`
- `Pic1.png`
- `Pic2.png`
- `Pic3.png`
- `Pic4.png`
- `Pic5.png`
- `Pic6.png`

## Performance observations
- Baseline page is a static HTML/CSS/JS app served directly from the repository.
- There is no build step or bundle analyzer evidence in the imported source.
- Runtime depends on multiple external CDNs, so baseline network performance is influenced by third-party availability and caching.
- Current JS size is ~45 KB; CSS size is ~4 KB; HTML size is ~27 KB.
- No asset licensing metadata or source/license status manifest exists in the current baseline.

## Local network trace summary
- Verified local preview for both pages:
  - `http://127.0.0.1:8000/` → `200 OK`
  - `http://127.0.0.1:8000/?page=order` → `200 OK`
- Local runtime assets fetched successfully from the local server:
  - `js/app.js` → `200 OK`, `text/javascript`, 45,985 bytes
  - `css/app.css` → `200 OK`, `text/css`, 4,078 bytes
- Referenced local image requests fail because the files are absent:
  - `logo.png` → `404 Not Found`
  - `Pic1.png`..`Pic6.png` are referenced in `js/app.js` but not present locally
- Remote asset dependencies are referenced from third-party CDNs:
  - `https://cdn.tailwindcss.com`
  - `https://cdn.jsdelivr.net/npm/chart.js`
  - `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
  - `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
  - `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=400;500;600;700;800&display=swap`
- Remote dependency license/source notes:
  - Chart.js is published under MIT.
  - Supabase JS is published under MIT.
  - SheetJS (xlsx) is published under Apache-2.0.
  - Font Awesome Free uses CC BY 4.0 for icons, SIL OFL 1.1 for fonts, and MIT for code.
  - Google Fonts content should be treated as SIL OFL for the font family, with terms governed by Google Fonts.

## Inventory conclusions for P00-T04
- The application currently has a small local runtime footprint, but it relies on unpinned CDN assets.
- Missing referenced images create a broken baseline path for the landing slideshow and logo display.
- No 3D assets were present, so the current baseline does not include any actual 3D model payload.
- The baseline evidence should be expanded with:
  - network HAR or browser trace for page load
  - asset license/source inventory
  - identified duplicate or dead references
  - initial Lighthouse/mobile performance measurements if a local preview is available

## Next step for P00-T04
- Capture a network trace or HAR from a local preview of `index.html` and `/?page=order`.
- Record missing image references and whether they are intentionally excluded from the imported baseline.
- Add asset license/source status details once the asset origin is verified.
