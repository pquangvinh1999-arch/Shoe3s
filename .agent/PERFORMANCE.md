# 3D Performance Strategy

- Content/form first; 3D is optional enhancement.
- Lazy import Three/R3F scene after idle/interaction.
- Device tiers: high, balanced, fallback.
- DPR cap, shadows/effects tiers, texture/mesh budgets.
- Pause renderer hidden/offscreen; demand render when static.
- One material transition mask preferred over duplicate shoe meshes.
- Test thermal/memory on mobile, not only desktop FPS.
- 60fps is a target on capable devices, not a reason to break low-end usability.
