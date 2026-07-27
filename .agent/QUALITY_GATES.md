# Quality Gates

## Per module
- format/lint/typecheck
- focused unit/integration tests
- self + code reviewer
- security/performance impact note
- evidence + checkpoint

## Before independent review
- clean build from fresh checkout
- full E2E booking/admin compatibility
- accessibility and performance evidence
- frozen commit SHA

## Before production
- all CI green
- no accepted Critical/High open
- database/RLS migration and rollback verified
- Cloudflare preview smoke pass
- release candidate and rollback rehearsal approved
