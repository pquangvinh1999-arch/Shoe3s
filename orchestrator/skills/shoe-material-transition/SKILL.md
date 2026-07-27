---
name: shoe-material-transition
description: Build dirty-to-clean shoe assets and shader pipeline.
when_to_use: P04/P05 shoe model, mask, material or transition.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Asset requirements

- License/source manifest.
- Clean UVs and consistent scale.
- Dirty mask separate from base color.
- Low/medium/high variants.
- KTX2 textures where supported.
- Meshopt/geometry optimization.
- Poster generated from same approved asset.

# Visual rules

Blend dirty/clean materials using mask and smooth transition. Avoid making
“clean” pure white or physically implausible. Keep camera stable during form
interaction. Validate skin/sole/materials under mobile lighting.
