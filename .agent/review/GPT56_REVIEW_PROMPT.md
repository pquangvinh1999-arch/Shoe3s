# GPT-5.6 Independent Review Prompt

Review the repository at immutable commit `<SHA>` without editing code.
Read AGENTS.md and `.agent/review/REVIEW_PROTOCOL.md` only for project rules; independently inspect implementation and tests.
Evaluate architecture, correctness, scalability, security, performance, maintainability, tests, UX/accessibility.
Score each rubric category and total /100. List blockers even when score is high.
Every finding must include evidence and a verification step.
Write `reports/BAO-CAO-GPT56-<YYYYMMDD>-<SHA7>.md` using the report template.
