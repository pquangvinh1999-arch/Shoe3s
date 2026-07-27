# Second Independent Reviewer Prompt

Model is configurable in `.agent/review/review-config.example.json` (for example a Gemini Flash model available to the user).
Review immutable commit `<SHA>` independently. Do not read the first review before producing your own report.
Use the same 100-point rubric and evidence standard.
Write `reports/BAO-CAO-REVIEWER-B-<YYYYMMDD>-<SHA7>.md`.
