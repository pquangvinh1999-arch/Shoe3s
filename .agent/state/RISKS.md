# RISKS — Evidence-backed register

| ID | Severity | Risk | Repository evidence | Required mitigation |
|---|---|---|---|---|
| R-001 | Blocker | Wrong or incomplete repository baseline | `START_HERE.md:1-3`; `orchestrator/STATE.json:3-6`; current Git baseline `Shoe3s@54b7916` | Confirm authoritative repo and import/restore actual source before implementation. |
| R-002 | Blocker | Canonical `.agent/` package missing despite manifest | `MANIFEST.md:4-97`; `scripts/agent_sync.py:5-15` | Restore original files and verify hashes; rerun preflight. |
| R-003 | Critical, unverified | Public client may control financial fields and direct Supabase insert | `docs/orchestrator/00_REPO_REVIEW.md:39-48` | Confirm in source/RLS; then use server-side validation/pricing and staged RLS cutover. |
| R-004 | High, unverified | Stored XSS/HTML injection through admin, receipt, or Telegram | `docs/orchestrator/00_REPO_REVIEW.md:50-57` | Trace all sinks; use text rendering/escaping; add negative tests and CSP. |
| R-005 | High, unverified | Supabase RLS and admin authorization unknown | `docs/orchestrator/00_REPO_REVIEW.md:18-22`; `docs/orchestrator/03_SECURITY.md:50-61` | Read-only policy matrix and anon/non-admin/admin negative tests before migration. |
| R-006 | High, unverified | Duplicate service/price maps can diverge across booking and POS | `docs/orchestrator/00_REPO_REVIEW.md:59-71` | Extract catalog only after capturing exact current prices and regression tests. |
| R-007 | High, unverified | Payment/VietQR total or account configuration could mismatch POS/invoice | `docs/orchestrator/03_SECURITY.md:5-12,81-84`; `orchestrator/RELEASE_RUNBOOK.md:39-45` | Document QR payload and total derivation; golden tests; protect payment config changes. |
| R-008 | High, unverified | Invoice/discount logic may accept unsafe input or produce inconsistent totals | `docs/orchestrator/03_SECURITY.md:12,104-114` | Establish money/rounding/discount invariants and receipt snapshots before migration. |
| R-009 | Medium, unverified | Telegram failure/injection can affect notification reliability | `docs/orchestrator/03_SECURITY.md:63-68,93-102` | Escape message fields, timeout, observe failures, and keep order durable. |
| R-010 | High, unverified | Reports and CRM may depend on legacy status/string/data shape | `docs/orchestrator/01_TARGET_ARCHITECTURE.md:88-109,118-121` | Reconcile report/CRM queries and preserve compatibility adapters until parity. |
| R-011 | High, unverified | Cloudflare environment, routes, and auto-deploy not validated | `docs/orchestrator/00_REPO_REVIEW.md:18-22,35` | Read-only config/env-name inventory; preview evidence; no production deploy in audit. |
| R-012 | Medium, unverified | Missing slideshow assets and heavy shared bundle | `docs/orchestrator/00_REPO_REVIEW.md:73-85` | Network/asset inventory and performance baseline once source/preview exists. |
| R-013 | Governance | Historical documentation may be mistaken for current implementation evidence | `docs/orchestrator/00_REPO_REVIEW.md:18-22`; absent source tree | Label every finding as verified, documented-only, or unknown. |
