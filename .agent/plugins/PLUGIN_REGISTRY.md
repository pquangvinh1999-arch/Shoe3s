# Plugin Registry

Plugin/app cần được kết nối và cấp quyền bởi người dùng/workspace; file trong repo không tự cài hay tự cấp quyền.

| Capability | Plugin/App | Required access | Use | Secret rule |
|---|---|---|---|---|
| Source control | GitHub | repo contents, PR, Actions as needed | read/write branch, PR, CI | OAuth only; no PAT in repo |
| Database/Auth | Supabase | selected project, least privilege | schema/RLS/docs/queries | never commit service role |
| Edge deploy | Cloudflare | selected account/project | Pages/Workers preview/deploy/logs | secrets via bindings |
| Browser QA | Playwright/local browser | preview URL | E2E, visual, accessibility | no production credentials in fixtures |
| Performance | Lighthouse CI | preview URL | Web Vitals budgets | public URL only |

Before use, record availability in `.agent/state/TOOL_AVAILABILITY.md`. Missing plugin must create a blocked item, not guessed output.
