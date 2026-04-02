# Examples

## Example 1: Channel Discovery

### User Prompt

`what channels is 005 - Mart - Clickhouse using?`

### Expected Behavior

1. Resolve dataset by `displayName` in `dataset/dataset.json`.
2. Inspect:
   - `models/combined_report/query.sql`
   - `dataset/client_dataset_config.yaml`
3. Return channels with confidence and evidence paths.

### Expected Output Shape

```text
workflow: bundle-query-transform@v1
dataset: 005 - Mart - Clickhouse (9799)
mode: bundle
channels:
- google (high)
- facebook (high)
- tiktok (high)
...
evidence:
- models/combined_report/query.sql: vars.combined_report.models.combined_report.channels.google
- dataset/client_dataset_config.yaml: channels.google.active: true
warnings: []
```

## Example 2: Field/Metric Discovery

### User Prompt

`which table has spend and campaign_name for 005 - Mart - Deepgram?`

### Expected Behavior

1. Search `warehouse/tables/*/fields/*.json` for `spend` and `campaign_name`.
2. Cross-check model SQL in `models/*/query.sql` if multiple candidates.
3. Return top table(s) and why.

### Expected Output Shape

```text
workflow: bundle-query-transform@v1
dataset: 005 - Mart - Deepgram (20189)
mode: bundle
answer: combined_report contains both fields.
evidence:
- warehouse/tables/combined_report/fields/spend.json
- warehouse/tables/combined_report/fields/campaign_name.json
```

## Example 3: Draft New Transformation + Dry Run

### User Prompt

`draft a model that reports cost, clicks, impressions by channel and date for Clickhouse and validate it`

### Expected Behavior

1. Draft SQL using combined report conventions.
2. Call `create_dry_run` with:
   - `account_id: self`
   - `context: TransformationModel`
   - `query: <draft_sql>`
3. Poll with `get_dry_run`.
4. If failed, revise and retry.
5. Return upload-ready result.

### Expected Output Shape

```text
workflow: bundle-query-transform@v1
dataset: 005 - Mart - Clickhouse (9799)
mode: hybrid
target_model_slug: channel_daily_rollup
sql_path: downloads/growth-nirvana/exports/9799/custom/channel_daily_rollup/query.sql
dry_run_id: 12345
dry_run_status: success
execution: not run (requires explicit user request)
warnings: []
```

## Example 4: Explicit Execution (Opt-in)

### User Prompt

`execute this validated query now`

### Expected Behavior

1. Confirm dry run is already successful.
2. Call `create_query_execution`.
3. Poll with `get_query_execution` using `include: results` and `row_limit`.
4. Return query execution status plus rows/columns (if returned).

## Example 5: Custom Model Discovery (combined_report derivative)

### User Prompt

`for this client, use the right combined report variant and show spend by channel for Feb 2026`

### Expected Behavior

1. Inspect `models/` for `combined_report*` candidates.
2. Read each candidate `query.sql` to identify:
   - source model unions
   - output spend field naming (for example `_cost`)
3. Pick the best-fit table (for example `combined_report_ff`).
4. Run query using chosen table and return evidence for why it was selected.

## Example 6: Variant-aware answer contract

### User Prompt

`for Feb 2026, what did Deepgram spend by channel?`

### Expected Output Shape

```text
workflow: bundle-query-transform@v1
dataset: 005 - Mart - Deepgram (20189)
mode: hybrid
selected_model: combined_report_ff
selection_rationale: pacing/reporting variant with channel remapping (Meta/Bing/X)
key_columns: date, channel, _cost
query_execution_id: <id>
run_state: done
results:
- Meta: 31228.29
- Bing: 4849.71
- X: 4120.36
evidence:
- models/combined_report_ff/query.sql
- warehouse/tables/combined_report_ff/fields/cost.json
warnings: []
```
