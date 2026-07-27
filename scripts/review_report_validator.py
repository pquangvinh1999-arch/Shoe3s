#!/usr/bin/env python3
from pathlib import Path
import sys,re
REQ=['Commit SHA','Architecture','Correctness','Security','Performance','Maintainability','Test quality','UX/accessibility','Total']
def main(path):
 p=Path(path); t=p.read_text(encoding='utf-8'); miss=[x for x in REQ if x.lower() not in t.lower()]
 if miss: print('INVALID REPORT missing:',', '.join(miss)); return 1
 if not re.search(r'\b100\b',t): print('WARNING: rubric max 100 not found')
 print('REPORT FORMAT OK'); return 0
if __name__=='__main__': raise SystemExit(main(sys.argv[1]))
