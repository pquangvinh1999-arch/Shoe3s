# DECISIONS

## D-20260727-01 — Repository evidence outranks package narrative

- Status: accepted
- Context: `Shoe3s` contains planning documents describing `Wed3s`, but not the
  described application.
- Decision: treat business statements as documented claims until confirmed by
  source, tests, or authorized runtime evidence.
- Consequence: no implementation is authorized from this review alone.
- Evidence: `orchestrator/CONTEXT.md:34-41`;
  `docs/orchestrator/00_REPO_REVIEW.md:18-22`.

## D-20260727-02 — Restore baseline before feature work

- Status: accepted
- Context: the manifest declares a canonical `.agent/` package that is absent,
  and preflight fails.
- Decision: the first Codex task is repository/package restoration and baseline
  capture, isolated from application changes.
- Alternatives: recreate missing canonical files from guesses; proceed using the
  legacy `orchestrator/` directory.
- Consequence: slower start, but avoids overwriting intended instructions or
  implementing against the wrong repository.
- Evidence: `MANIFEST.md:4-97`; `scripts/agent_sync.py:5-15`.

## D-20260727-03 — Preserve the documented migration principles

- Status: accepted, pending source verification
- Decision: retain incremental migration, secure booking before 3D, a single
  service catalog, legacy status compatibility, and no-WebGL fallback.
- Evidence: `docs/orchestrator/08_DECISION_RECORDS.md:3-38`.

## D-20260727-04 — External systems remain read-only during baseline audit

- Status: accepted
- Decision: Supabase and Cloudflare may be inspected read-only only after the
  authoritative project is identified; no database or deployment mutation is
  part of P00.
- Evidence: user scope; `docs/orchestrator/06_MIGRATION_PLAN.md:13-16`.

## D-20260727-05 — Three.js is not part of the current handoff task

- Status: accepted
- Decision: do not install or implement Three.js until secure booking, verified
  baseline, accessible non-WebGL booking, and asset licensing gates pass.
- Evidence: user scope; `docs/orchestrator/08_DECISION_RECORDS.md:9-20`;
  `docs/orchestrator/06_MIGRATION_PLAN.md:23-39`.
