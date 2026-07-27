#!/usr/bin/env python3
from __future__ import annotations
import argparse
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("asset_dir", nargs="?", default="apps/web/public")
parser.add_argument("--model-mobile-max", type=int, default=1_500_000)
parser.add_argument("--poster-max", type=int, default=300_000)
args = parser.parse_args()

root = Path(args.asset_dir)
if not root.exists():
    raise SystemExit(f"Asset directory not found: {root}")

failed = False
for p in sorted(root.rglob("*")):
    if not p.is_file():
        continue
    size = p.stat().st_size
    limit = None
    if p.suffix.lower() in {".glb", ".gltf"} and ("low" in p.stem.lower() or "mobile" in p.stem.lower()):
        limit = args.model_mobile_max
    elif p.suffix.lower() in {".avif", ".webp", ".jpg", ".jpeg", ".png"} and "poster" in p.stem.lower():
        limit = args.poster_max
    if limit and size > limit:
        failed = True
        print(f"FAIL {p}: {size} > {limit}")
    else:
        print(f"OK   {p}: {size}")
raise SystemExit(1 if failed else 0)
