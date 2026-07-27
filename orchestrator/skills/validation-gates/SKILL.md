---
name: validation-gates
description: Prove Wed3s changes across behavior, security, accessibility and performance.
when_to_use: Task completion, phase gate, release.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Gate layers

1. Format/lint/type.
2. Unit/domain.
3. API contract and negative cases.
4. Supabase RLS matrix.
5. Booking/admin E2E.
6. No-WebGL/reduced-motion.
7. A11y.
8. Asset/bundle/performance budget.
9. Secret/dependency scan.
10. Preview smoke and rollback.

Store exact command, exit status, summary and artifact path.
