# Asset Manifest (P00-T04 Baseline)

This manifest records the baseline application's local and remote assets, license/source metadata, and current status for the imported `Wed3s` snapshot.

| Asset | Type | Source / URL | License / Source | Status | Notes |
|---|---|---|---|---|---|
| `index.html` | Local HTML | repo root | baseline snapshot | present | 27,278 bytes |
| `css/app.css` | Local CSS | repo root | baseline snapshot | present | 4,078 bytes |
| `js/app.js` | Local JS | repo root | baseline snapshot | present | 45,985 bytes |
| `logo.png` | Local image | referenced in `index.html` | baseline snapshot | missing in repo | present in `Wed3s-main.zip` at `Wed3s-main/logo.png` (2,220,881 bytes) |
| `Pic1.png` | Local image | referenced in `js/app.js` slideshow | baseline snapshot | missing in repo | present in `Wed3s-main.zip` (734,617 bytes) |
| `Pic2.png` | Local image | referenced in `js/app.js` slideshow | baseline snapshot | missing in repo | present in `Wed3s-main.zip` (906,542 bytes) |
| `Pic3.png` | Local image | referenced in `js/app.js` slideshow | baseline snapshot | missing in repo | present in `Wed3s-main.zip` (695,358 bytes) |
| `Pic4.png` | Local image | referenced in `js/app.js` slideshow | baseline snapshot | missing in repo | present in `Wed3s-main.zip` (492,282 bytes) |
| `Pic5.png` | Local image | referenced in `js/app.js` slideshow | baseline snapshot | missing in repo | absent from `Wed3s-main.zip` archive; snapshot appears incomplete |
| `Pic6.png` | Local image | referenced in `js/app.js` slideshow | baseline snapshot | missing in repo | absent from `Wed3s-main.zip` archive; snapshot appears incomplete |
| `https://cdn.tailwindcss.com` | Remote CDN script | Tailwind CSS official CDN | MIT | external | unpinned runtime dependency |
| `https://cdn.jsdelivr.net/npm/chart.js` | Remote CDN script | Chart.js official CDN | MIT | external | 208,522 bytes via HEAD |
| `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2` | Remote CDN script | Supabase JS official CDN | MIT | external | 208,389 bytes via HEAD |
| `https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js` | Remote CDN script | SheetJS CDN | Apache-2.0 | external | unpinned runtime dependency |
| `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` | Remote CDN CSS | Font Awesome Free CDN | Icons CC BY 4.0 / Fonts SIL OFL 1.1 / Code MIT | external | license header present in CSS file |
| `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght=400;500;600;700;800&display=swap` | Remote Google Fonts CSS | Google Fonts service | SIL OFL (Plus Jakarta Sans) | external | font license should be verified with Google Fonts terms |

## Notes

- `logo.png` and `Pic1.png`..`Pic6.png` are confirmed to exist inside the original `Wed3s-main.zip` archive, but they were not imported into the workspace repository. This supports the conclusion that the baseline snapshot is incomplete for local image assets.
- Remote dependencies are loaded directly from unpinned CDN URLs. A production-ready hardening plan should replace these with versioned package artifacts and/or local vendored assets.
- The manifest currently does not include custom asset licenses for baseline source files because the repository snapshot does not provide an explicit project-wide license.
- The `https://3shoe.pages.dev/?page=order` preview link is a published deployment reference in the baseline UI text, not a local asset.
