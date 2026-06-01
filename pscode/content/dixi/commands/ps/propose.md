---
name: "PS: Propose (Dixi)"
description: Propose a new change with Dixi stack-aware context
category: Workflow
tags: [workflow, artifacts, propose, dixi]
---

Propose a new change with Dixi architectural awareness.

**Dixi preamble** (execute before generating any artifact):
1. Read `.pscode-dixi.yaml` (if present) to identify `stack` and `family`.
2. Read `pastelsdd/context/architecture.md` (if present) to load architectural constraints — use them as guardrails when writing the proposal and design.

Then execute the standard `pscode-propose` skill instructions in full.
