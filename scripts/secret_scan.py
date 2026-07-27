#!/usr/bin/env python3
from pathlib import Path
import argparse,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
PAT=[re.compile(r'(?i)(service[_-]?role|bot[_-]?token|api[_-]?secret)\s*[:=]\s*[\'\"][^\'\"]{8,}'),re.compile(r'eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{10,}')]
def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--changed',action='store_true'); ap.add_argument('--non-blocking',action='store_true'); a=ap.parse_args()
 files=[]
 if a.changed:
  try: files=[ROOT/x for x in subprocess.check_output(['git','diff','--name-only','HEAD'],cwd=ROOT,text=True).splitlines()]
  except: pass
 if not files: files=[p for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.parts and p.stat().st_size<2_000_000]
 hits=[]
 for p in files:
  try:t=p.read_text(errors='ignore')
  except:continue
  for pat in PAT:
   if pat.search(t): hits.append(str(p.relative_to(ROOT))); break
 print('SECRET SCAN', 'PASS' if not hits else 'REVIEW');
 for h in hits: print('-',h)
 return 0 if (not hits or a.non_blocking) else 1
if __name__=='__main__': raise SystemExit(main())
