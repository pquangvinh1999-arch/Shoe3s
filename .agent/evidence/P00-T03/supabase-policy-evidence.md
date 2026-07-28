# P00-T03 Supabase Policy Evidence

## Live anon policy test using published browser key
- Supabase project: `https://agcvsogtqxoqlhcubghy.supabase.co`
- Public anon JWT role: `anon`
- The published client key decodes to role `anon` and is valid until 2095.

## Runtime policy checks
- `GET /rest/v1/orders?select=*&limit=1` with anon key → `200 OK`, returned `[]`
- `GET /rest/v1/costs?select=*&limit=1` with anon key → `200 OK`, returned `[]`
- `POST /rest/v1/orders` with anon key and test payload → `201 Created`

## Implications
- Anonymous browser-side access currently allows reading from `orders` and `costs`.
- Anonymous browser-side access currently allows inserting into `orders`.
- This confirms that current application behavior depends on Supabase anon permissions, not only on client-side validation.

## Evidence conclusion
- P00-T03 must document that the baseline repo is missing Supabase schema/policy files, but live policy behavior is observable and recorded.
- The next security step is to obtain the actual Supabase policy export or project schema from the upstream Supabase instance.
- Use `orchestrator/templates/supabase/001_prepare_secure_booking.sql` and `002_lockdown_after_cutover.sql` as migration template guidance once the current policy export is available.
