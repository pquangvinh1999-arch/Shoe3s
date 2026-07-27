# REPOSITORY RESEARCH — Wed3s business systems

Date: 2026-07-27  
Repository inspected: `pquangvinh1999-arch/Shoe3s`  
Baseline: `main@54b7916cdcc73f4241d46ca9facb785b4e933c57`

## Method and confidence model

Only repository content was used. No Supabase query, Cloudflare inspection,
Telegram call, payment action, database change, or deployment was performed.

- **Verified:** directly visible in the current source/tree or executable local
  check.
- **Documented-only:** asserted by repository documents, but the implementing
  source/runtime is absent.
- **Unknown:** insufficient repository evidence.

The current repository contains orchestration documents and templates, not the
Wed3s application described by them. Therefore all business behavior below is
documented-only unless explicitly stated otherwise.

## System findings

| Area | Documented current behavior | Evidence | Confidence | What Codex must verify |
|---|---|---|---|---|
| Booking | Public route `/?page=order`; booking creates `orders`; statuses include `Chờ thanh toán`, `Chờ nhận đơn`, `Đã hoàn thành`. Client may currently calculate total/status and insert directly. | `docs/orchestrator/00_REPO_REVIEW.md:9-16,26-29,39-48`; `docs/orchestrator/04_DATA_API_CONTRACTS.md:31-45` | Documented-only | Form fields, validation, catalog/prices, insert code, duplicate handling, error UX, route behavior. |
| Supabase | Auth/Data used; at least `orders` and `costs`; admin uses Supabase Auth. Actual RLS, data, and production policies were not verified by the prior review. | `docs/orchestrator/00_REPO_REVIEW.md:10-12,18-22,27`; `orchestrator/CONTEXT.md:18-21` | Documented-only | Schema, constraints, triggers, RLS matrix, roles, service role use, indexes, auth/session enforcement. |
| Telegram | Notification follows booking; server-side file was reportedly `functions/api/telegram.js`; token reportedly moved to Cloudflare env. | `docs/orchestrator/00_REPO_REVIEW.md:11,29,94-95` | Documented-only | Actual function, escaping, timeout, retry/failure semantics, response checking, secret history. |
| POS | Booking reportedly links to POS via `pendingBookingId`; POS manages quantity, custom service and discount. | `docs/orchestrator/00_REPO_REVIEW.md:30-31,95`; `orchestrator/TASKS.json:40-52` | Documented-only | State transfer, line-item parsing, custom pricing permissions, quantity/discount arithmetic, concurrency and audit log. |
| Payment | New booking reportedly starts `Chờ thanh toán`, then checkout/POS, then `Đã hoàn thành`; payment configuration is sensitive business logic. | `docs/orchestrator/04_DATA_API_CONTRACTS.md:31-42`; `docs/orchestrator/03_SECURITY.md:11-12,104-114` | Documented-only | Supported methods, cash/bank transfer state, paid timestamp, reconciliation, refund/cancel behavior, role controls. |
| VietQR | VietQR exists; bank identifier/account are public configuration, while changes to payment config require protection. | `docs/orchestrator/00_REPO_REVIEW.md:32`; `docs/orchestrator/03_SECURITY.md:81-84,104-114` | Documented-only | Payload format, amount/content generation, account ownership/config source, QR library/API, total parity and snapshots. |
| Invoice | 58 mm receipt printing exists; untrusted values may enter receipt HTML; invoice/discount logic is an asset. | `docs/orchestrator/00_REPO_REVIEW.md:33,50-57`; `docs/orchestrator/03_SECURITY.md:5-12,63-69` | Documented-only | Template, numbering, totals/tax/discount rules, print CSS, escaping, reprint, cancel/void, browser/printer matrix. |
| Reports | Dashboard and finance reportedly read `orders`/`costs`; existing status strings/data shape must remain compatible. | `docs/orchestrator/00_REPO_REVIEW.md:34`; `docs/orchestrator/01_TARGET_ARCHITECTURE.md:88-109` | Documented-only | KPI formulas, date/timezone boundaries, cash vs transfer, expense categories, profit, exports, permissions and query performance. |
| CRM | CRM reportedly uses `orders`/`costs`; admin migration is intended module-by-module. | `docs/orchestrator/00_REPO_REVIEW.md:34`; `docs/orchestrator/06_MIGRATION_PLAN.md:41-44` | Documented-only | Customer identity/deduplication, visit/rank rules, contact history, PII exposure, deletion/retention and authorization. |
| Cloudflare | Static Pages + Pages Function and auto-deploy are reported; env names, logs, analytics and production domain were not verified. | `docs/orchestrator/00_REPO_REVIEW.md:7,18-22,35`; `docs/orchestrator/01_TARGET_ARCHITECTURE.md:67-79` | Documented-only | Project/branch mapping, build command/output, Functions routes, env-name inventory, headers, domains, preview/prod separation, rollback. |

## Cross-system flow currently claimed

1. Customer opens `/?page=order`.
2. Browser selects services and creates an order in Supabase.
3. Telegram is notified after booking.
4. Booking is transferred to POS.
5. POS adjusts quantity/custom services/discount.
6. VietQR or other checkout completes payment.
7. A 58 mm receipt is printed.
8. Dashboard, finance/reporting, and CRM consume order/cost data.

This flow is synthesized from
`docs/orchestrator/00_REPO_REVIEW.md:24-35`; it is not a verified trace.

## Repository-integrity research

- Verified Git baseline: one branch (`main`) at `54b7916...`.
- Verified tracked tree: 79 files; no application files such as `index.html`,
  `js/app.js`, or `functions/api/telegram.js`.
- `MANIFEST.md:4` declares 178 package files.
- `MANIFEST.md:8-97` lists canonical `.agent/` files that are absent.
- Safe preflight fails at `agent_sync` because canonical context/state are
  missing.
- The manifest hash entries can be used to validate restored originals.

## Research conclusion

The repository supports a credible risk hypothesis and migration strategy, but
does not supply enough evidence to confirm any current production business
behavior. The implementation plan is therefore handoff-ready only with a
mandatory restoration and source-baseline gate first.
