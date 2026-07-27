---
name: supabase-rls
description: Audit and stage Supabase RLS for Shoe3s.
when_to_use: Any schema/policy/auth/data API task.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Protocol

1. Fetch current Supabase docs/changelog.
2. Read current tables/policies/grants.
3. Build matrix: anon, authenticated non-admin, admin, service.
4. Verify RLS on exposed tables.
5. Do not use user-editable metadata for authorization.
6. UPDATE needs SELECT and appropriate USING/WITH CHECK.
7. Avoid SECURITY DEFINER as permission shortcut.
8. Test in preview.
9. Cut client to secure API.
10. Only then revoke anonymous direct writes.
11. Run advisors and save evidence.
