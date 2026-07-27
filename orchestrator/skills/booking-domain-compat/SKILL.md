---
name: booking-domain-compat
description: Centralize catalog/order/status while preserving Shoe3s behavior.
when_to_use: P01, service pricing, order schema, POS compatibility.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Rules

- Extract current data; never invent price.
- Stable service IDs.
- One authoritative catalog.
- Server-side quote.
- Keep persisted legacy status strings initially.
- Provide adapters for legacy `services` string.
- Test every known service, contact-price service, quantity and discount.
