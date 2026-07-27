---
name: secure-order-api
description: Build public booking API with validation, pricing and idempotency.
when_to_use: P02 public order creation. NOT for admin UI.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Request gate

- POST only.
- JSON content type.
- body size limit.
- Zod schema and length limits.
- Turnstile server validation.
- normalized phone.
- allowlisted service IDs.
- unique idempotency key.

# Authority

Server sets:
- item names/prices;
- total;
- status;
- time;
- source;
- pricing version.

# Failure design

- request ID;
- generic client error;
- structured server log with redaction;
- Telegram failure does not delete order;
- replay returns original success.
