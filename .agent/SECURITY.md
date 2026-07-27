# Security Baseline

- Server recalculates service prices and allowed statuses.
- Public order endpoint validates size/format, Turnstile, rate limits and idempotency.
- Supabase RLS denies unauthorized writes; anon key is not authorization.
- Telegram content is escaped and payload-limited.
- User/database strings are never interpolated into unsafe HTML.
- Secrets only in Cloudflare/Supabase secret stores or local untracked env.
- Dependency versions pinned with lockfile; security advisories reviewed.
- Logs redact phone/address/token and use request IDs.
