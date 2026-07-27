#!/usr/bin/env bash
set -euo pipefail

COMMAND="${*:-}"
if [[ -z "$COMMAND" ]]; then
  exit 0
fi

deny() {
  echo "BLOCKED by Wed3s guardrail: $1" >&2
  exit 64
}

[[ "$COMMAND" =~ rm[[:space:]]+-rf[[:space:]]+(/|\.|\*) ]] && deny "destructive rm"
[[ "$COMMAND" =~ git[[:space:]]+push.*--force ]] && deny "force push"
[[ "$COMMAND" =~ git[[:space:]]+reset[[:space:]]+--hard ]] && deny "hard reset without explicit recovery task"
[[ "$COMMAND" =~ supabase[[:space:]]+db[[:space:]]+reset ]] && deny "database reset"
[[ "$COMMAND" =~ (cat|printenv|env)[[:space:]].*(\.env|dev\.vars) ]] && deny "secret file output"
[[ "$COMMAND" =~ wrangler[[:space:]].*deploy ]] && [[ "${ALLOW_PROD_DEPLOY:-0}" != "1" ]] && deny "deploy requires release task and ALLOW_PROD_DEPLOY=1"

exit 0
