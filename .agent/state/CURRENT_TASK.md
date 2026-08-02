# Current Task

- Task ID: `P03-T01`
- Owner: `secure-backend-engineer`
- Status: `active`
- Goal: Secure public order API and server pricing.
- Allowed changes: `functions/api/orders.js`, `functions/api/telegram.js`, `js/order-schema.js`, tests, evidence.
- Forbidden changes: admin flows, schema/status text, public route behavior breakage, deployment.
- Required evidence:
  - `.agent/evidence/P03-T01/`
- Gate state: `implementation_gate = pending`; code allowed for this task only.
- Next action: Complete `functions/api/orders.js` per docs/03+04: Turnstile server-side verify, idempotency (payload hash + unique key), rate limit, error envelope, safe Telegram notification after insert, body size limit; add unit tests; run secret scan + npm test.
