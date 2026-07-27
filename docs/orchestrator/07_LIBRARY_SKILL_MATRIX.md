# 07 — Thư viện, repo và skills đề xuất

> Snapshot nghiên cứu: 2026-07-26. Codex phải kiểm tra release/changelog/license
> trước khi pin version.

## Core runtime

| Repo/package | Vai trò | Quyết định |
|---|---|---|
| `mrdoob/three.js` | WebGL/WebGPU engine | Bắt buộc gián tiếp/trực tiếp |
| `pmndrs/react-three-fiber` | React renderer cho Three.js | Bắt buộc cho scene |
| `pmndrs/drei` | Helpers/controls/loaders | Dùng chọn lọc, tránh import thừa |
| `greensock/GSAP` | Timeline/camera/scroll | Chọn một motion engine chính |
| `pmndrs/zustand` | State nhỏ, tách khỏi scene | Khuyến nghị |
| `colinhacks/zod` | Schema client/server | Bắt buộc |
| `react-hook-form/react-hook-form` | Form performant | Khuyến nghị |
| `supabase/supabase-js` | Auth/data client | Giữ, pin version |

## 3D asset pipeline

| Repo/package | Vai trò | Quyết định |
|---|---|---|
| `donmccurdy/glTF-Transform` | inspect/dedupe/prune/texture pipeline | Bắt buộc CI asset |
| `zeux/meshoptimizer` | geometry compression/optimization | Khuyến nghị |
| Khronos KTX-Software/Basis Universal | compressed GPU textures | Khuyến nghị |
| `pmndrs/postprocessing` | effect composition | Optional, high tier |
| Blender CLI | bake/mask/LOD/export | Tool ngoài npm |

## Quality

| Tool | Vai trò |
|---|---|
| Vitest | unit/domain tests |
| Playwright | booking/admin E2E |
| axe-core | accessibility |
| Lighthouse CI | budgets |
| ESLint + TypeScript | static gates |
| Knip | unused code/dependency |
| Gitleaks hoặc TruffleHog | secret scan |
| Supabase advisors | DB/security review |

## Không dùng hoặc dùng thận trọng

- Tailwind CDN production.
- Nhiều motion engines cùng lúc.
- Postprocessing trên tất cả thiết bị.
- GPU tier package có benchmark stale làm nguồn quyết định duy nhất.
- Model từ repo/marketplace không rõ license.
- Runtime CDN scripts không pin/SRI.
- CSS glass blur phủ toàn viewport.
- Video autoplay lớn thay cho fallback nhẹ.

## Skills cần load theo task

- `repo-archeology`
- `booking-domain-compat`
- `secure-order-api`
- `shoe-material-transition`
- `adaptive-webgl`
- `supabase-rls`
- `cloudflare-pages-functions`
- `resume-checkpoint`
- `validation-gates`

Các skill này nằm trong `orchestrator/skills/`; AG Kit generic trong `.agents/`
chỉ load khi thật sự cần.
