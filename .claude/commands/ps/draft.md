---
name: "ps:draft"
description: Takes a natural-language request and drafts a guided change.
generatedBy: 2.16.0
---

# /ps:draft

Take a natural-language request from the user and draft a guided change.

Use the **pscode-guided-sdd** skill.

1. Understand the change.
2. Create the folder `pscode/changes/<slug>` (slug in kebab-case).
3. Create or update `brief.md`.
4. Run the **Grill Me** logic (skill `pscode-grill-me`), at most 5 questions.
5. **Stop and ask for validation.**

Do not write code in this step.
