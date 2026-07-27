# SECURITY QUICK RULES

Read full spec: `docs/orchestrator/03_SECURITY.md`.

Block immediately:
- secret in frontend/diff/log;
- direct anonymous order write after P02 cutover;
- client-controlled total/status;
- unescaped HTML from user/DB;
- RLS policy that grants all authenticated users all rows;
- production deploy without negative authorization tests;
- model/asset with unclear license.

Required security evidence:
- secret scan;
- RLS policy matrix;
- API contract negative tests;
- Turnstile server validation;
- idempotency replay test;
- Telegram HTML escape test;
- CSP/header report;
- dependency lockfile/review.
