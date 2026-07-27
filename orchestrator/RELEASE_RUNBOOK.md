# RELEASE RUNBOOK

## Preconditions

- P07 gate complete.
- Preview deployment green.
- RLS and API negative tests green.
- Feature flags documented.
- DB migration reviewed/backed up.
- Rollback commit/deployment known.
- Required env names configured without exposing values.

## Preview

1. Build from clean checkout.
2. Deploy preview.
3. Run route, booking, admin, POS, QR, receipt smoke.
4. Run mobile/no-WebGL/reduced-motion.
5. Submit test order and reconcile DB + Telegram.
6. Verify no production data used unintentionally.

## Canary

- Enable 3D for controlled percentage/path if supported.
- Monitor JS errors, function errors, order conversion, duplicates and Web Vitals.
- Keep poster fallback and old deployment available.

## Production

- Apply only reviewed migrations.
- Deploy immutable commit.
- Verify `/`, `/?page=order`, API health.
- Place one labeled canary order, then clean it per business policy.
- Watch logs without PII.
- Record deployment ID/commit/evidence.

## Rollback triggers

- Booking creation failure.
- Duplicate orders.
- Admin authorization regression.
- POS/receipt total mismatch.
- Critical JS crash/no fallback.
- Significant performance regression.
- Secret exposure.

## Rollback

1. Disable 3D feature flag.
2. Revert frontend deployment.
3. Keep compatible DB columns.
4. Do not re-enable public direct DB write as a “quick fix”.
5. Forward-fix API/RLS or restore previous secure function.
