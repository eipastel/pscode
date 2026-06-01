---
name: "PS: Apply (Dixi)"
description: Implement tasks with Dixi stack-aware context
category: Workflow
tags: [workflow, apply, dixi]
---

Implement tasks with Dixi architectural awareness.

**Dixi preamble** (execute before starting implementation):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pscode/context/architecture.md` (if present) to load architectural constraints — use them as guardrails during implementation.
3. Read `pscode/context/testing.md` (if present) to load testing conventions.

Then execute the standard `pscode-apply-change` skill instructions in full.
