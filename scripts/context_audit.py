#!/usr/bin/env python3
from pathlib import Path
import argparse, json
ROOT=Path(__file__).resolve().parents[1]
SECTIONS=['Mục tiêu dự án','Phạm vi tính năng','Tech stack','Coding style','Design System','UI/UX guideline','Quy tắc đặt tên','Rule coding','Quy trình review','Quy tắc commit','Tiêu chuẩn chất lượng']
def main():
 p=argparse.ArgumentParser(); p.add_argument('--non-blocking',action='store_true'); a=p.parse_args()
 ctx=ROOT/'.agent/MASTER_CONTEXT.md'; state=ROOT/'.agent/state/STATE.json'
 issues=[]
 if not ctx.exists(): issues.append('missing canonical context')
 else:
  txt=ctx.read_text(encoding='utf-8')
  issues += [f'missing section: {s}' for s in SECTIONS if s not in txt]
 if not state.exists(): issues.append('missing state')
 for rel in ['AGENT.md','AGENTS.md','.agent/AGENT_ROUTING.md','.agent/PLAN.json']:
  if not (ROOT/rel).exists(): issues.append('missing '+rel)
 print('CONTEXT AUDIT', 'PASS' if not issues else 'FAIL')
 for x in issues: print('-',x)
 return 0 if (not issues or a.non_blocking) else 1
if __name__=='__main__': raise SystemExit(main())
