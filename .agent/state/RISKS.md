# Risk Register

| ID | Risk | Severity | Mitigation | Status |
|---|---|---:|---|---|
| R-001 | Client controls price/status/order insert | Critical | Server-side order API + RLS cutover | Open |
| R-002 | Stored/reflected XSS from dynamic HTML | High | React escaping, sanitize boundaries, no unsafe innerHTML | Open |
| R-003 | 3D bundle harms booking conversion | High | lazy chunk, fallback, adaptive quality | Open |
| R-004 | Work/Codex context drift | High | canonical state + handoff commits + sync checker | Open |
| R-005 | Deployment breaks admin/POS | Critical | compatibility E2E + staged rollout + rollback rehearsal | Open |
| R-006 | Source application has not been imported into Shoe3s | Critical | Import and inventory the baseline application source before approving the Context Gate | Mitigated — baseline imported in P00-T02, inventory in asset_manifest.md |
| R-007 | Booking/admin/payment/Supabase runtime cannot be verified | Critical | Keep implementation gates blocked until the baseline source and runtime configuration are available for audit | Open — live anon-key REST verified (P00-T03); policy export still pending for P03-T02 |
