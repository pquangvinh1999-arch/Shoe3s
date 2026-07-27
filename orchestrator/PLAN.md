# PLAN — Shoe3s 3D Booking

Task source of truth: `TASKS.json`.

Phases:
- P00 Baseline/audit
- P01 Domain extraction
- P02 Secure booking API + RLS
- P03 React/TypeScript shell + accessible booking
- P04 3D asset pipeline
- P05 Adaptive 3D experience
- P06 Admin incremental migration
- P07 Release quality gate
- P08 Cutover
- P09 Handover

Critical path:

```text
P00-T01
 ├─ P00-T02 ─ P01-T01 ─ P01-T02 ─┐
 ├─ P00-T03 ───────────────────────┼─ P02-T01 ─ T02 ─ T03 ─ T04
 └─ P00-T04 ───────────────────────┘                    │
                                                        P03 → P04 → P05
                                                                   │
                                                                   P06 → P07 → P08 → P09
```

Do not parallelize tasks that modify the same data contract or deployment
surface. Audit tasks may run in parallel only when evidence is isolated.
