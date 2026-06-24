---
name: pscode-grill-me
description: "Interrogates a request before implementation — objective questions that reduce ambiguity, at most 5, asked through AskUserQuestion (structured choices + free-text), recorded in questions.md. Use it to validate understanding before writing specs or code."
generatedBy: 3.1.0
---

# Grill Me

Ask useful questions to reduce ambiguity **before** writing specs or code.

## How to ask (prefer AskUserQuestion)

**Always prefer the `AskUserQuestion` tool** to put questions to the user — at
any step, not just here. It makes answering a one-tap choice instead of free
prose. For each question:

- Offer **2–4 concrete options**; put your **recommended** option first and mark
  it `(recomendado)`. The free-text "Other" field is always there for anything
  you didn't anticipate, so you never need to add it yourself.
- Base the recommendation on the actual code/context, not a guess.
- Use a short `header` (≤12 chars) per question; batch related questions into one
  call (up to 4) instead of asking them one by one.

If `AskUserQuestion` isn't available in the current agent, fall back to a plain
numbered list with the same recommended-answer-first structure.

## Rules

- Ask **objective** questions; avoid obvious ones.
- Focus on: expected behavior, scope, exceptions and validation.
- **At most 5 questions** (see `limits.max_questions` in `pscode/config.yaml`).
- Record everything in `pscode/changes/<slug>/questions.md`:

```
# Grill Me
- [x] Answered question — answer
- [ ] Still-open question
```

When done, **stop and ask for validation**. Don't write code.
