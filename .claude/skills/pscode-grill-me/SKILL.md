---
name: pscode-grill-me
description: "Interrogates a request before implementation — objective questions that reduce ambiguity, at most 5, recorded in questions.md. Use it to validate understanding before writing specs or code."
generatedBy: 2.16.0
---

# Grill Me

Ask useful questions to reduce ambiguity **before** writing specs or code.

## How to act

- Ask **objective** questions; avoid obvious ones.
- Focus on: expected behavior, scope, exceptions and validation.
- **At most 5 questions** (see `limits.max_questions` in `pscode/config.yaml`).
- Whenever possible, offer a recommended answer based on the code.
- Record everything in `pscode/changes/<slug>/questions.md`:

```
# Grill Me
- [x] Answered question — answer
- [ ] Still-open question
```

When done, **stop and ask for validation**. Don't write code.
