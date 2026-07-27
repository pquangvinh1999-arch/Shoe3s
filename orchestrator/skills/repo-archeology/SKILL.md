---
name: repo-archeology
description: Map Wed3s code and behavior without changing it.
when_to_use: P00, unknown coupling, legacy regressions. NOT for implementation.
allowed-tools: Read, Grep, Glob, Bash
---

# Workflow

1. `git status`, `git rev-parse`, `git ls-files`.
2. Identify entrypoints/routes.
3. Search Supabase table calls, status strings, price literals, innerHTML,
   fetch, env references and asset URLs.
4. Build data-flow:
   user → browser → Supabase/function → admin/POS/report.
5. Record invariants and exact evidence.
6. Do not call “dead code” until runtime/search evidence agrees.
