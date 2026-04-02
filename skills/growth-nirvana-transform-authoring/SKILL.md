---
name: growth-nirvana-transform-authoring
description: Draft and refine Growth Nirvana transformation SQL using bundle model conventions and MCP dry-run validation. Use when users ask to create/update model SQL or prepare upload-ready transformations.
---

# Growth Nirvana Transform Authoring

## Purpose

Produce reliable transformation SQL drafts with evidence-based model alignment and validation loops.

## Workflow

1. Resolve dataset by `displayName` and inspect relevant model folders:
   - `models/<slug>/query.sql`
   - `models/<slug>/model.json`
   - `models/<slug>/data_transformation.json`
2. Identify target variant context:
   - `combined_report`
   - `combined_report_ff`
   - `combined_report_catalog`
   - other custom marts
3. Draft SQL in style consistent with neighboring models.
4. Validate with `create_dry_run(context=TransformationModel)`.
5. Poll with `get_dry_run` to terminal.
6. If errors, revise and rerun dry run until success.
7. Return upload-ready handoff details.

## Guardrails

- Never skip dry run.
- Never execute query unless user explicitly asks.
- Always note assumptions about source models and column semantics.
- If variant-specific remapping exists, preserve it unless user asks to change it.

## Response Contract

- `workflow: transform-authoring@v1`
- dataset + target model slug
- model variant context
- draft summary
- dry run id/status/errors
- final SQL path/content summary
- upload handoff notes

## Resources

- Examples: [examples.md](examples.md)
- Troubleshooting: [troubleshooting.md](troubleshooting.md)
