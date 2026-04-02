# Reference: Bundle-First Query + Transform

## Bundle Layout

Expected bundle root shape:

```text
<bundle_root>/
  manifest.json
  dataset/
    dataset.json
    client_dataset_config.json
    client_dataset_config.yaml
  models/
    <model_slug>/
      query.sql
      model.json
      data_transformation.json
  warehouse/
    tables/
      <table>.json
      <table>/fields/<field>.json
```

## Known Bundle Roots In This Project

- `downloads/growth-nirvana/exports/20189/unzipped/dataset_20189_20260330143119`
- `downloads/growth-nirvana/exports/9799/unzipped/dataset_9799_20260330143749`
- `downloads/growth-nirvana/exports/19949/unzipped/dataset_19949_20260330175610`

## Channel Discovery Signals

Primary SQL signal:

- `models/combined_report/query.sql`
- fallback: `models/combined_report_*/query.sql`

Patterns to search:

- `vars.combined_report.models.combined_report.channels.`
- `{{models.self.`
- `union all`

Config signal files:

- `dataset/client_dataset_config.yaml`
- fallback `dataset/client_dataset_config.json`

Config tokens:

- `channels`
- `active`
- channel names under combined report config

## Variant Matrix (All Paid Pro)

| Variant | Typical role | Source pattern in SQL | Common caveat |
|---|---|---|---|
| `combined_report` | Base paid-media reporting table | Unions in-dataset channel marts via `models.self.*` | Best default, but still validate field names |
| `combined_report_ff` | Funnel-focused/custom blend | Reads connector `combined_report` plus additional sources (for example HubSpot) | May rename channels and alter metric semantics |
| `combined_report_catalog` | Catalog/taxonomy + web blend | Reads connector `combined_report` + GA4-like model(s) | Includes non-paid rows with zero ad spend metrics |

Selection rule:

1. Start with `combined_report`.
2. If question maps to custom business logic/funnel/catalog reporting, inspect `combined_report_*` variants.
3. Use the variant used by downstream models for that reporting context when present.

## Variant Evidence Paths

- Base: `.../models/combined_report/query.sql`
- FF: `.../models/combined_report_ff/query.sql`
- Catalog: `.../models/combined_report_catalog/query.sql`

Concrete examples in this repo:

- Deepgram FF variant:
  - `downloads/growth-nirvana/exports/20189/unzipped/dataset_20189_20260330143119/models/combined_report_ff/query.sql`
- Clickhouse Catalog variant:
  - `downloads/growth-nirvana/exports/9799/unzipped/dataset_9799_20260330143749/models/combined_report_catalog/query.sql`
- CrowdStrike base variant:
  - `downloads/growth-nirvana/exports/19949/unzipped/dataset_19949_20260330175610/models/combined_report/query.sql`

## Useful Local Searches

- Find dataset by display name:
  - search all `dataset/dataset.json` and match `displayName`
- Find where a metric/field appears:
  - search `models/*/query.sql`
  - search `warehouse/tables/*/fields/*.json`
- Find candidate model for a concept:
  - search model slugs in `models/*/`
  - confirm with `model.json` and `data_transformation.json`

## MCP Query Validation Tools

- `create_dry_run`
  - required: `query`, `context`
  - recommended: `context: TransformationModel`, `account_id: self`
- `get_dry_run`
  - required: `dry_run_id`
- `create_query_execution`
  - required: `query`
  - run only on explicit user request
- `get_query_execution`
  - required: `query_execution_id`
  - for same-call results, use:
    - `include: results`
    - optional `includeResults: true` (compatibility alias)
    - optional `row_limit: <positive int>`

Optional metadata helpers when local bundle context is insufficient:

- `search_warehouse_tables`, `search_warehouse_fields`
- `list_dataset_warehouse_tables`, `list_dataset_warehouse_fields`

## Known Failure Patterns

- Bundle has no `combined_report` but has derivative (`combined_report_*`):
  - use derivative for channel inference and mark reduced confidence.
- Config and SQL disagree:
  - report both signals and confidence downgrade.

## Acceptance Checks (Executed)

All checks queried Feb 2026 spend by channel with `get_query_execution(include=results, row_limit=50)`:

- CrowdStrike (`combined_report`, execution `131980`):
  - Google `2300762.66`
  - LinkedIn `314595.06`
- Deepgram (`combined_report_ff`, execution `131981`):
  - Google `286511.85`, LinkedIn `162420.92`, Meta `31228.29`, Reddit `6323.12`, Bing `4849.71`, X `4120.36`
  - Note: FF variant remaps channel names (Facebook->Meta, Microsoft->Bing, Twitter->X).
- Clickhouse (`combined_report_catalog`, execution `131982`):
  - no rows for Feb 2026 in this query shape
  - caveat: catalog variant may contain blended rows with taxonomy/web context; validate date coverage and filters before interpreting zero spend.

## Customer Installation

Recommended install set (copy all three folders):

- `~/.cursor/skills/growth-nirvana-bundle-query-transform/`
- `~/.cursor/skills/growth-nirvana-bundle-query/`
- `~/.cursor/skills/growth-nirvana-transform-authoring/`

Minimum files:

- each folder's `SKILL.md`
- query skill: `common-queries.md`, `examples.md`, `troubleshooting.md`
- authoring skill: `examples.md`, `troubleshooting.md`

Reliable trigger phrases:

- `what channels is <client name> using`
- `find which table/field contains <metric>`
- `draft a new transformation and dry-run it`
