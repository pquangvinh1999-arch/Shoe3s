# 05 — Performance budgets và quality levels

## User-facing targets

| Metric | Target |
|---|---:|
| LCP p75 mobile | ≤ 2.5 s |
| INP p75 | ≤ 200 ms |
| CLS | ≤ 0.10 |
| Booking usable without 3D | 100% |
| High-tier 3D | target 60 FPS |
| Medium-tier floor | 30 FPS, tự hạ quality |
| Input latency during form | không phụ thuộc render loop |

## Bundle budgets

| Asset | Mobile initial | Deferred/high |
|---|---:|---:|
| HTML/CSS/booking shell JS gzip | ≤ 180 KB | — |
| 3D JS chunk gzip | deferred, ≤ 350 KB | ≤ 500 KB |
| Initial model + textures transfer | ≤ 1.5 MB | ≤ 3 MB |
| Hero poster | ≤ 180 KB | ≤ 300 KB |
| Admin chart/xlsx | không tải ở booking | lazy |

Budgets là gate dự án, có thể điều chỉnh bằng evidence thật; không được tăng chỉ
để làm build xanh.

## Scene budgets

| Tier | Triangles | Draw calls | DPR |
|---|---:|---:|---:|
| Low | ≤ 80k | ≤ 35 | ≤ 1.25 |
| Medium | ≤ 150k | ≤ 50 | ≤ 1.5 |
| High | ≤ 250k | ≤ 70 | ≤ 2.0 |

## Runtime downgrade triggers

- FPS trung bình thấp liên tục.
- Long tasks tăng khi form active.
- Device memory thấp hoặc WebGL capabilities hạn chế.
- Context lost.
- `prefers-reduced-motion`.
- Save-Data.
- Tab hidden/offscreen.

Downgrade phải giảm theo thứ tự:
1. particles;
2. postprocessing;
3. shadow/reflection;
4. DPR;
5. texture/model LOD;
6. poster fallback.

## Measurement

- Lighthouse CI mobile.
- Playwright trace.
- Web Vitals RUM.
- Frame sampling trong dev/profiling.
- Bundle analyzer.
- Network test slow 4G.
- Test Android mid-range thật trước release.

Không lấy desktop developer machine làm bằng chứng mobile.
