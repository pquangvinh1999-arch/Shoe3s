#!/usr/bin/env python3
from pathlib import Path
import argparse, sys
ROOT=Path(__file__).resolve().parents[1]
required=[ROOT/'AGENT.md',ROOT/'AGENTS.md',ROOT/'.agent/MASTER_CONTEXT.md',ROOT/'.agent/state/STATE.json']

def main():
 p=argparse.ArgumentParser(); p.add_argument('--check',action='store_true'); a=p.parse_args()
 missing=[str(x.relative_to(ROOT)) for x in required if not x.exists()]
 bad=[]
 for f in [ROOT/'AGENT.md',ROOT/'AGENTS.md']:
  if f.exists() and '.agent/MASTER_CONTEXT.md' not in f.read_text(encoding='utf-8'): bad.append(str(f.relative_to(ROOT)))
 if missing or bad:
  print('AGENT SYNC FAILED'); print('missing:',missing); print('missing canonical reference:',bad); return 1
 print('AGENT SYNC OK: Work and Codex entrypoints reference canonical context.')
 return 0
if __name__=='__main__': raise SystemExit(main())
