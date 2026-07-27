#!/usr/bin/env bash
set -euo pipefail
cmd="${*:-}"
case "$cmd" in
  *"rm -rf /"*|*"git reset --hard"*|*"git clean -fd"*|*"git push --force"*)
    echo "BLOCKED: destructive command requires explicit approved rollback decision." >&2; exit 2;;
  *"supabase"*"db"*|*"wrangler"*"deploy"*|*"cloudflare"*"deploy"*)
    grep -q '"release_candidate_gate": "approved"' .agent/state/STATE.json || {
      echo "BLOCKED: release candidate gate not approved." >&2; exit 3; };;
esac
