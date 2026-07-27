# Merge into existing Shoe3s repo

- Create branch: `chore/P00-T01-orchestrator-v2`.
- Copy package contents into repo root.
- Do not remove or overwrite existing `.agents/`; `.agent/` is intentionally singular and project-specific.
- Resolve root `AGENTS.md` by using the v2 file as Codex entrypoint; preserve useful legacy instructions through references, not duplicated conflicting rules.
- Keep user images under `docs/design/reference/` as reference-only until rights confirmed.
- Run preflight, inspect `git diff`, commit, push and open PR.
