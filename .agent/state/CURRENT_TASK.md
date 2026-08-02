# Current Task

- Task ID: `P03-T03`
- Owner: `domain-architect`
- Status: `active`
- Goal: Extract shared service catalog and compatibility adapters.
- Allowed changes: `js/service-catalog.js`, `js/app.js` (POS section only), tests, evidence.
- Forbidden changes: booking behavior, admin flow breakage, schema/status text, deployment.
- Required evidence:
  - `.agent/evidence/P03-T03/`
- Gate state: `implementation_gate = pending`; code allowed for this task only.
- Next action: Replace hard-coded `activePaymentServices` in `js/app.js` with `serviceCatalog`-derived items; keep POS custom-service and discount behavior identical; add unit test proving labels/prices match catalog.
