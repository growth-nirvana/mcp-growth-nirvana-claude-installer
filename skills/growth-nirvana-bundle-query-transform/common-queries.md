# Common Query Cookbook

Use these as starting templates. Replace `<dataset_name>` with the warehouse dataset name from `dataset/dataset.json` (`name` field), for example:

- `account_947291_fivetran_log_client_connector_2652_preferential_shine`
- `account_947291_fivetran_log_client_connector_2652_mart_clickhouse_app`

## 0) First: discover the right model/table

Before querying, confirm whether to use:

- `combined_report`
- or custom derivative (`combined_report_ff`, `combined_report_catalog`, etc.)

Inspect local model SQL in `models/*/query.sql` and identify:

- source models referenced (`{{models.self.<slug>}}`)
- selected output fields (for example `_cost` vs `cost`)
- filters and unions that affect results

### Validate columns before every query

For selected table `<selected_table>`, check:

- `warehouse/tables/<selected_table>/fields/channel.json`
- `warehouse/tables/<selected_table>/fields/date.json`
- spend metric candidate (`_cost`, `cost`, or variant-specific)

If fields are missing in metadata, inspect `models/<selected_table>/query.sql` and derive aliases from `SELECT` output.

## 1) Channels currently active in data

```sql
select distinct channel
from `<dataset_name>.combined_report`
where channel is not null
order by 1
```

## 2) Spend by channel for a month

```sql
select
  channel,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1
order by 2 desc
```

## 3) Daily spend trend by channel

```sql
select
  date,
  channel,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1, 2
order by 1, 2
```

## 4) Top campaigns by spend

```sql
select
  campaign_name,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and campaign_name is not null
group by 1
order by 2 desc
limit 25
```

## 5) CTR / CPC by channel

```sql
select
  channel,
  sum(_impressions) as impressions,
  sum(_clicks) as clicks,
  round(safe_divide(sum(_clicks), nullif(sum(_impressions), 0)), 4) as ctr,
  round(safe_divide(sum(_cost), nullif(sum(_clicks), 0)), 2) as cpc
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
group by 1
order by 3 desc
```

## 6) Conversion efficiency by channel

```sql
select
  channel,
  round(sum(_cost), 2) as spend,
  sum(_conversions) as conversions,
  round(safe_divide(sum(_cost), nullif(sum(_conversions), 0)), 2) as cpa
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
group by 1
order by 2 desc
```

## 7) Budget pacing (month-to-date)

```sql
select
  date,
  round(sum(_cost), 2) as daily_spend,
  round(sum(sum(_cost)) over (order by date), 2) as cumulative_spend
from `<dataset_name>.combined_report`
where date >= date_trunc(current_date(), month)
  and date <= current_date()
group by 1
order by 1
```

## 8) Source model coverage check

Useful when custom derivatives exist and you need to see what feeds the final table:

```sql
select
  channel,
  count(*) as row_count
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
group by 1
order by 2 desc
```

Then compare with model SQL unions in local `models/combined_report*/query.sql`.

## 9) Missing data diagnostic

```sql
select
  min(date) as min_date,
  max(date) as max_date,
  count(*) as row_count
from `<dataset_name>.combined_report`
```

## 10) Quick QA for key fields

```sql
select
  countif(channel is null) as null_channel_rows,
  countif(date is null) as null_date_rows,
  countif(_cost is null) as null_cost_rows
from `<dataset_name>.combined_report`
```

## Variant-specific templates

### A) `combined_report` (base paid media)

Use for default paid-media answers.

```sql
select
  channel,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1
order by 2 desc
```

### B) `combined_report_ff` (funnel/custom blend)

Use when model SQL shows union with additional funnel source(s) and business channel remapping.

```sql
select
  channel,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report_ff`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1
order by 2 desc
```

Optional funnel overlay:

```sql
select
  channel,
  round(sum(_cost), 2) as spend,
  sum(signup) as signups,
  sum(mql) as mqls,
  sum(customer) as customers
from `<dataset_name>.combined_report_ff`
where date >= '2026-02-01'
  and date < '2026-03-01'
group by 1
order by 2 desc
```

### C) `combined_report_catalog` (catalog + GA4 blend)

Use when catalog/taxonomy dimensions exist (for example `Type`, `Budget`) and GA4 rows are unioned.

```sql
select
  channel,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report_catalog`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1
order by 2 desc
```

Taxonomy split:

```sql
select
  Type,
  Budget,
  round(sum(_cost), 2) as spend
from `<dataset_name>.combined_report_catalog`
where date >= '2026-02-01'
  and date < '2026-03-01'
group by 1, 2
order by 3 desc
```

## Execution Pattern (MCP)

1. Start with `create_dry_run`.
2. On success, run `create_query_execution`.
3. Retrieve rows with `get_query_execution` using:
   - `include: "results"`
   - `includeResults: true`
   - `row_limit: <n>`
