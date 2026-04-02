# Troubleshooting

## No rows returned

- Check date range and timezone assumptions.
- Run monthly spend trend query to confirm data coverage.
- Confirm selected model variant is correct for this question.

## Column errors (`Unrecognized name: cost`)

- Inspect `warehouse/tables/<table>/fields/*.json`.
- Use `_cost` if metadata says `name: "_cost"`.

## Unexpected channels

- Inspect variant SQL for remaps (for example Meta/Bing/X aliases).
- State remapping caveat in final answer.

## Execution returns metadata but no rows field

- Ensure `get_query_execution` includes:
  - `include: "results"`
  - `row_limit: <n>`
