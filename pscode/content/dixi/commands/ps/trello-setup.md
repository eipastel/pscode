---
name: "PS: Trello Setup (Dixi)"
description: "Configure Trello integration for your Pscode workflow — checks MCP, reads or creates a board, and writes pscode/trello.yaml"
category: Setup
tags: [trello, setup, integration, config, dixi]
---

Configure Trello integration for your Pscode workflow.

This skill writes `pscode/trello.yaml` — a small config file that all Trello-aware commands
(`/ps:draft`, `/ps:propose`, `/ps:apply`, `/ps:complete`) read at runtime to know which
Trello list corresponds to each workflow stage and which labels are available.

Then execute the standard `pscode-trello-setup` skill instructions in full.
