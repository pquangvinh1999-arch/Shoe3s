# TOOLS

## Required

- Git/GitHub
- Node + Corepack
- pnpm (preferred once workspace is created)
- TypeScript
- Cloudflare Wrangler
- Supabase CLI or Supabase MCP
- Playwright
- Lighthouse CI
- Python 3 for orchestrator scripts

## 3D pipeline

- Blender CLI
- glTF Transform CLI
- meshoptimizer
- KTX2/Basis compression tools

## Discovery protocol

Do not guess CLI flags. Run:
```bash
node --version
corepack --version
pnpm --version
npx wrangler --version
supabase --version
<tool> --help
```

## Connected tools

- GitHub connector: repo/PR/issue context.
- Supabase connector/CLI: schema, policy and advisor evidence.
- Cloudflare dashboard/CLI: preview, env names, functions, logs.

Never copy tool output containing secrets into Markdown.
