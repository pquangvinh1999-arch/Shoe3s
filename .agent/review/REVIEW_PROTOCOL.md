# Independent Review Protocol

1. Freeze a commit SHA; reviewers must inspect the same SHA.
2. Start a new chat/session for each reviewer; do not reuse implementer context except repository documents.
3. Reviewer cannot edit code during scoring.
4. Every finding includes severity, file/line/evidence, impact, reproduction and recommended verification.
5. Score categories total 100:
   - Architecture 15
   - Correctness/business logic 20
   - Security/privacy 20
   - Performance/3D resilience 15
   - Maintainability 10
   - Test quality 10
   - UX/accessibility 10
6. A high score does not override Critical/High findings.
7. Store reports in `reports/` outside application source modules.
8. Consensus is evidence-based, not majority voting.
