# P00-T03 Request for Supabase Policy Export

## Purpose
This document records the need to obtain the Supabase project schema and policy export for the current `agcvsogtqxoqlhcubghy` project.

## Required evidence
- Supabase schema export of `public.orders` and `public.costs` tables.
- RLS policies for `orders` and `costs`.
- Any row-level security or auth role definitions used by the project.
- Any audit logs or policy descriptions for anonymous `anon` access.

## Why this is needed
- The current repo contains only runtime evidence and no policy files.
- Live anon behavior proves the policy state, but does not show the exact policy definitions.
- This export is necessary to complete P00-T03 and to safely plan the P02/T02 RLS hardening sequence.

## Use these templates after export
- `orchestrator/templates/supabase/001_prepare_secure_booking.sql`
- `orchestrator/templates/supabase/002_lockdown_after_cutover.sql`

## Recommended command
If Supabase CLI is available:

```bash
supabase db remote set https://agcvsogtqxoqlhcubghy.supabase.co
supabase db dump --schema public --file supabase-export.sql
```

Or from the Supabase dashboard:
- Export table schema for `orders` and `costs`.
- Export policy definitions for `public.orders` and `public.costs`.
