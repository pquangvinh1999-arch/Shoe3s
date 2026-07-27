# Risk Register

| ID | Risk | Severity | Mitigation | Status |
|---|---|---:|---|---|
| R-001 | Client controls price/status/order insert | Critical | Server-side order API + RLS cutover | Open |
| R-002 | Stored/reflected XSS from dynamic HTML | High | React escaping, sanitize boundaries, no unsafe innerHTML | Open |
| R-003 | 3D bundle harms booking conversion | High | lazy chunk, fallback, adaptive quality | Open |
| R-004 | Work/Codex context drift | High | canonical state + handoff commits + sync checker | Open |
| R-005 | Deployment breaks admin/POS | Critical | compatibility E2E + staged rollout + rollback rehearsal | Open |
