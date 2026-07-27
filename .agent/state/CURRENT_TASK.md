# CURRENT TASK — Codex handoff

## Active task

`P00-T01-RESTORE-VERIFIABLE-BASELINE`

## Objective

Make the repository auditable before implementation. Resolve whether the working
repository is `pquangvinh1999-arch/Shoe3s` or
`pquangvinh1999-arch/Wed3s`, restore the canonical `.agent/` package from the
original artifact, and make the actual Wed3s application source available on a
dedicated branch.

## Why this is the only safe next task

- `START_HERE.md:1-3` says this package must be copied into `Wed3s`.
- `WORK_START.md:6-17` also names `pquangvinh1999-arch/Wed3s`.
- `MANIFEST.md:4,8-97` declares 178 package files including the canonical
  `.agent/` context/state/workflows.
- At baseline commit `54b7916`, the repository contains 79 tracked files and no
  `.agent/` directory or application source.
- `scripts/preflight.sh` fails at `scripts/agent_sync.py:5-15` because the
  canonical context and state are absent.
- `docs/orchestrator/00_REPO_REVIEW.md:5-12` describes a different repository
  and application files that are not present here.

## Required inputs

1. Owner confirmation of the authoritative repository.
2. Original orchestrator artifact matching the SHA-256 entries in
   `MANIFEST.md`, or a trusted commit containing it.
3. Actual application source including the paths referenced by
   `orchestrator/TASKS.json:40-46`.

## Acceptance criteria

- Repository identity is explicit and consistent in entry documents and state.
- Original `.agent/MASTER_CONTEXT.md`, `.agent/PLAN.json`, routing, state, and
  workflows 01-04 are restored and match their manifest hashes, or the manifest
  is intentionally regenerated with a recorded decision.
- Application files needed for the baseline audit are present.
- `bash scripts/preflight.sh` passes without changing application behavior.
- Baseline evidence records branch, HEAD, tracked tree, routes, and unavailable
  external evidence.
- No application code, dependency, database, or deployment change is mixed into
  this restoration task.

## Stop condition

Do not begin domain extraction, secure booking work, Three.js installation,
database migration, or deployment until this task passes and a fresh
repository-backed context review is approved.
