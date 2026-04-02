# Common Queries (Bundle Query Skill)

Use `<dataset_name>` from `dataset/dataset.json.name`.

## Select model/table first

1. Inspect `models/combined_report*/query.sql`.
2. Pick model that matches business context:
   - `combined_report`: default paid media
   - `combined_report_ff`: funnel/custom blend
   - `combined_report_catalog`: catalog/taxonomy + GA4 blend
3. Validate fields in `warehouse/tables/<table>/fields/*.json`.

## Spend by channel for month

```sql
select
  channel,
  round(sum(_cost), 2) as spend
from `<dataset_name>.<selected_table>`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1
order by 2 desc
```

## CPC and CTR by channel

```sql
select
  channel,
  sum(_impressions) as impressions,
  sum(_clicks) as clicks,
  round(safe_divide(sum(_clicks), nullif(sum(_impressions), 0)), 4) as ctr,
  round(safe_divide(sum(_cost), nullif(sum(_clicks), 0)), 2) as cpc
from `<dataset_name>.<selected_table>`
where date >= '2026-02-01'
  and date < '2026-03-01'
  and channel is not null
group by 1
order by 3 desc
```

## Monthly spend trend

```sql
select
  format_date('%Y-%m', date_trunc(date, month)) as month,
  round(sum(_cost), 2) as spend
from `<dataset_name>.<selected_table>`
where _cost is not null
group by 1
having spend > 0
order by 1
```

## Last month with spend

```sql
select
  format_date('%Y-%m', date_trunc(max(date), month)) as last_month_with_data
from `<dataset_name>.<selected_table>`
where _cost > 0
```
