---
name: adaptive-webgl
description: Keep Wed3s 3D smooth through progressive enhancement and runtime downgrade.
when_to_use: P05 scene/runtime performance.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Mandatory

- Poster-first.
- Canvas lazy.
- No-WebGL path.
- reduced-motion path.
- pause hidden/offscreen.
- demand rendering when static.
- adaptive DPR and feature toggles.
- dispose resources.
- context loss recovery.
- no heavy loop during booking input.

# Downgrade order

particles → post FX → shadows/reflections → DPR → LOD → poster.

Measure on real mobile; do not infer from desktop.
