# IMPLEMENTATION PLAN — Codex handoff

## Plan status

Ready for handoff, with implementation blocked until Work Package 0 passes.
This plan does not authorize application code, Three.js installation, database
changes, or deployment during the current session.

## Non-negotiable controls

- Evidence order: reproducible behavior/tests → current source → authorized
  Supabase/Cloudflare read-only evidence → decisions → historical documents.
- Preserve `/?page=order`, `/`, legacy status strings, totals, receipts, reports,
  CRM and POS behavior until parity is demonstrated.
- Separate schema changes from dependent frontend cutover.
- Security and a complete no-WebGL booking path precede 3D.
- Every work package ends with tests, evidence, checkpoint and rollback notes.

## WP0 — Restore and verify the baseline

Owner: Codex repository maintainer  
Depends on: none  
Change type: repository documentation/package restoration only

Tasks:

1. Confirm whether `Shoe3s` or `Wed3s` is authoritative.
2. Create a dedicated working branch from the confirmed baseline.
3. Restore the original `.agent/` files and verify against `MANIFEST.md` hashes.
4. Add/import the actual application source without overwriting unrelated
   history.
5. Run preflight, capture tracked tree, branch, HEAD, routes and tool versions.
6. Repeat context review against source and update every documented-only finding.

Acceptance:

- Preflight passes.
- Actual code paths referenced by the task graph exist.
- Every business area has a source path or an explicit unknown.
- No behavior, dependency, database, or deployment change.

Stop if repository ownership, history, or source import target is ambiguous.

## WP1 — Freeze current behavior with evidence

Depends on: WP0

Create regression baselines for:

- booking route, validation, services, prices and order creation;
- Supabase auth/session and read/write call map;
- Telegram payload and failure behavior;
- booking-to-POS transfer, quantities, custom services and discounts;
- payment states, cash/transfer logic and VietQR payload;
- 58 mm invoice totals, content, escaping and printing;
- dashboard/report/finance formulas and exports;
- CRM identity, visit/rank logic and PII access;
- Cloudflare build/routes/headers/config names and preview behavior.

Acceptance:

- Tests or reproducible manual traces cover each flow.
- Current defects are marked baseline-known rather than silently corrected.
- Non-sensitive evidence contains exact source paths and commands.

## WP2 — Audit security and data contracts read-only

Depends on: WP0; may proceed alongside WP1 only with isolated evidence.

1. Inventory service catalog and all duplicate price/status maps.
2. Map `orders`, `costs`, related tables, triggers and constraints.
3. Inspect RLS policies and role authorization read-only.
4. Trace every untrusted input to DOM, receipt, Telegram and logs.
5. Inventory Cloudflare environment variable names without values.
6. Scan HEAD and history for secret patterns; rotate externally if exposure is
   confirmed, without writing secrets into reports.
7. Document payment, invoice, reporting and CRM invariants.

Acceptance:

- Anon/non-admin/admin permission matrix exists.
- All financial fields have an authoritative derivation owner.
- All critical findings have evidence, severity and remediation dependency.
- No schema/config/runtime mutation.

## WP3 — Establish one compatible domain model

Depends on: WP1 and WP2 approval  
First application-code package

1. Extract stable service IDs and exact current names/prices.
2. Define money, quantity, discount and rounding invariants.
3. Define order/payment/status constants while persisting legacy text.
4. Add adapters between structured items and the legacy `services` string.
5. Add golden tests for booking, POS, VietQR, invoice and report totals.

Acceptance:

- One authoritative price catalog.
- Legacy data round-trips.
- Existing UI/report/POS outputs remain equal for baseline fixtures.
- No database change in the same package.

## WP4 — Secure order and Telegram path

Depends on: WP3 and approved security design

1. Implement a server-side order endpoint with method/content/body/schema limits,
   trusted pricing, idempotency and minimal errors.
2. Validate bot protection server-side.
3. Insert orders durably, then notify Telegram with escaped fields, timeout and
   observable independent failure.
4. Cut the public form to the API on preview.
5. Only after canary parity, propose a separate reviewed RLS migration to revoke
   anonymous direct writes.

Acceptance:

- Client total/status are ignored or rejected.
- Retries do not duplicate orders.
- Telegram failure does not lose an order.
- XSS/HTML-injection and permission-negative tests pass.
- RLS change has its own rollback/forward-fix plan.

## WP5 — Reconcile POS, payment, VietQR and invoice

Depends on: WP3; integrate with WP4 API contract

1. Preserve booking-to-POS linkage.
2. Centralize line totals, custom services, quantity and discount rules.
3. Generate VietQR amount/content from the same authoritative payable total.
4. Protect payment configuration and financial state changes by role.
5. Render receipt values as text/escaped content and verify 58 mm print snapshots.
6. Add audit events for total/discount/payment/status changes.

Acceptance:

- POS payable total = VietQR amount = persisted total = invoice total.
- Cash/transfer transitions and reprints are deterministic.
- Unauthorized financial writes fail.
- Existing fixtures remain compatible.

## WP6 — Reconcile reports and CRM

Depends on: WP5

1. Define KPI formulas, timezone/date boundaries and expense/profit rules.
2. Reconcile dashboard and exports against known order/cost fixtures.
3. Define CRM customer identity/deduplication and ranking/visit rules.
4. Limit PII by role and document retention/deletion behavior.
5. Add query/index recommendations only after measuring real queries.

Acceptance:

- Report totals reconcile to fixtures and POS/payment records.
- CRM results are stable under duplicate names/phones.
- Access-control tests cover financial and PII data.

## WP7 — Frontend foundation without Three.js

Depends on: WP4-WP6 parity

Validate the proposed React/Vite/TypeScript shell in a small spike. Preserve
routes and split public/admin bundles. Deliver a complete keyboard/mobile booking
path with poster/CSS fallback before any WebGL dependency is introduced.

Acceptance:

- Booking works with WebGL disabled.
- Admin-only chart/xlsx code does not load on public booking.
- Route, accessibility and performance baselines pass.
- Architecture decision updated from proposed to accepted or rejected by
  evidence.

## WP8 — 3D research and implementation

Depends on: WP7; outside the current requested stages

Only now select a licensed asset, define budgets, install approved dependencies,
and build lazy adaptive 3D with reduced-motion and poster fallback. Three.js is
not installed during planning.

## WP9 — Release gates and deployment

Depends on: all approved implementation packages; outside current scope

Run unit, contract, E2E, RLS-negative, visual, mobile, accessibility,
performance, security and recovery gates. Use preview → canary → production only
after rollback rehearsal and explicit approval.

## Exact next Codex instruction

> Execute only `P00-T01-RESTORE-VERIFIABLE-BASELINE` from
> `.agent/state/CURRENT_TASK.md`. Do not change application behavior, install
> Three.js, modify Supabase, or deploy. Stop after preflight passes and the
> source-backed context review/evidence checkpoint is committed.
