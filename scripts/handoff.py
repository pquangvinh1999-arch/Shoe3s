#!/usr/bin/env python3
from pathlib import Path
import argparse, json, datetime, subprocess
ROOT=Path(__file__).resolve().parents[1]; P=ROOT/'.agent/state/ACTIVE_SESSION.json'
def sha():
 try:return subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
 except:return None
def load(): return json.loads(P.read_text()) if P.exists() else {}
def save(d): P.write_text(json.dumps(d,indent=2)+"\n")
def main():
 ap=argparse.ArgumentParser(); sub=ap.add_subparsers(dest='cmd',required=True)
 sub.add_parser('status')
 p=sub.add_parser('prepare'); p.add_argument('--from',dest='src',required=True,choices=['work','codex']); p.add_argument('--to',dest='dst',required=True,choices=['work','codex'])
 p=sub.add_parser('accept'); p.add_argument('--actor',required=True,choices=['work','codex'])
 a=ap.parse_args(); d=load(); now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 if a.cmd=='status': print(json.dumps(d,indent=2)); return 0
 if a.cmd=='prepare':
  d.update({'actor':None,'handoff_from':a.src,'handoff_to':a.dst,'prepared_at':now,'base_sha':sha()}); save(d); print('Handoff prepared; commit and push state before switching.'); return 0
 if d.get('handoff_to') not in (None,a.actor): print('Handoff is intended for',d.get('handoff_to')); return 2
 d.update({'actor':a.actor,'handoff_to':None,'accepted_at':now,'base_sha':sha()}); save(d); print('Handoff accepted by',a.actor); return 0
if __name__=='__main__': raise SystemExit(main())
