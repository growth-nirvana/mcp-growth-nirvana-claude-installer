---
name: growth-nirvana-bundle-query
description: Answer analytics and schema questions from downloaded Growth Nirvana All Paid Pro bundles, with optional MCP execution and result retrieval. Use when users ask channels, spend, CTR/CPC, table/field discovery, or model selection.
---

# Growth Nirvana Bundle Query

## Purpose

Answer questions from bundle files first, then optionally run live queries via MCP.

## Workflow

1. Resolve dataset by matching `dataset/dataset.json.displayName`.
2. Select reporting model:
   - inspect `models/combined_report*` and related downstream models
   - choose `combined_report` or variant (`combined_report_ff`, `combined_report_catalog`, etc.)
3. Validate fields in:
   - `warehouse/tables/<selected_table>/fields/*.json`
4. Build SQL based on validated fields.
5. If execution is needed:
   - run `create_query_execution`
   - fetch with `get_query_execution(include=results, row_limit=...)`
6. Return answer with evidence and rationale.

## Guardrails

- Do not assume `cost`; verify `_cost`/`cost`.
- If variant logic changes semantics (for example Meta/Bing/X remaps), state that clearly.
- If no rows returned, provide date-coverage diagnostic query.

## Response Contract

- `workflow: bundle-query@v1`
- dataset and selected model/table
- answer summary
- SQL used (or summary)
- execution id/run state when executed
- result rows summary and truncation flag when requested
- evidence paths and caveats

## Resources

- Query templates: [common-queries.md](common-queries.md)
- Usage examples: [examples.md](examples.md)
- Troubleshooting: [troubleshooting.md](troubleshooting.md)
