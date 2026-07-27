#!/usr/bin/env bash
set -euo pipefail
mkdir -p orchestrator/evidence
{
  echo "timestamp_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "branch=$(git branch --show-current 2>/dev/null || true)"
  echo "head=$(git rev-parse --short HEAD 2>/dev/null || true)"
  echo "diff_stat:"
  git diff --stat 2>/dev/null || true
} > orchestrator/evidence/last-tool-state.txt
