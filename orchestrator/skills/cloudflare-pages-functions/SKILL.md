---
name: cloudflare-pages-functions
description: Implement and deploy Wed3s edge API on Cloudflare Pages Functions.
when_to_use: Functions, Turnstile, env, preview or deployment.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Protocol

- Verify current Cloudflare docs and Wrangler schema.
- Keep root `functions/` routing compatible unless evidence supports advanced mode.
- Secrets via environment bindings only.
- Validate Turnstile server-side.
- Add explicit timeout and response headers.
- Test local/preview/production separately.
- Record env variable names, never values.
- Preserve static asset fallback.
