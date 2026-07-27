# DECISIONS

Use this format:

```md
## D-YYYYMMDD-NN — Title
- Status: proposed | accepted | superseded
- Context:
- Decision:
- Alternatives:
- Consequences:
- Evidence:
```

Initial accepted decisions are summarized in
`docs/orchestrator/08_DECISION_RECORDS.md`.

## D-20260726-01 — Security before 3D
- Status: accepted
- Context: public client currently constructs financial/order fields.
- Decision: finish P02 before P05.
- Alternatives: add 3D first.
- Consequences: less visual progress early, much lower abuse/migration risk.
- Evidence: static review; validate in P00.

## D-20260726-02 — Progressive enhancement
- Status: accepted
- Context: mobile capability varies.
- Decision: no-WebGL booking is a release requirement.
- Alternatives: WebGL-only landing.
- Consequences: requires poster/CSS path and duplicate visual QA, improves reach.
