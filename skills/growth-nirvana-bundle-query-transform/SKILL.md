---
name: growth-nirvana-bundle-query-transform
description: Route Growth Nirvana bundle tasks to focused workflows for query answering and transformation authoring. Use when users ask mixed requests spanning model discovery, querying, and SQL drafting.
---

# Growth Nirvana Bundle Query + Transform Router

## Purpose

Use this as the high-level router skill. For best performance and consistency, delegate to one specialized skill based on user intent.

## Decision Tree

- If the user asks analytical questions (channels, spend, CTR/CPC, table/field discovery), use the query workflow skill:
  - `../growth-nirvana-bundle-query/SKILL.md`
- If the user asks to draft/edit transformation SQL, use the authoring workflow skill:
  - `../growth-nirvana-transform-authoring/SKILL.md`
- If the request mixes both, run query workflow first (to select model + fields), then authoring workflow.

## Shared Constraints

- Always resolve dataset by `dataset/dataset.json.displayName`.
- Always perform model selection before querying or drafting.
- Never assume metric names (`_cost` vs `cost`) without checking field metadata.
- Prefer bundle evidence; use MCP for validation/execution.
- Include result rows only when requested (`include=results`, `row_limit`).

## Response Contract

Always include:

- `workflow: bundle-query-transform@v2`
- dataset display name + dataset id
- selected model/table + rationale
- action performed (`query` or `authoring`)
- evidence paths
- warnings/conflicts and next steps

## Additional Resources

- Query workflow skill: `../growth-nirvana-bundle-query/SKILL.md`
- Authoring workflow skill: `../growth-nirvana-transform-authoring/SKILL.md`
- Existing deep reference docs in this folder:
  - [reference.md](reference.md)
  - [examples.md](examples.md)
  - [common-queries.md](common-queries.md)
