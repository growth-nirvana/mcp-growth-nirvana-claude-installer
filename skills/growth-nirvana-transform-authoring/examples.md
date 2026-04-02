# Examples

## Example: Add derived metric to existing model

Prompt:
`update combined_report_ff to include cpm by channel and validate`

Expected:
- inspect current `combined_report_ff/query.sql`
- patch draft SQL
- run dry run loop
- return upload-ready SQL and dry-run status

## Example: Create new model variant

Prompt:
`create combined_report_brand_only from combined_report_catalog and validate`

Expected:
- inspect `combined_report_catalog` logic and fields
- draft new model SQL with explicit filters
- dry-run until success

## Example: Explain and edit safely

Prompt:
`show what this model is doing, then add a campaign_type dimension`

Expected:
- explain current SQL behavior first
- preserve variant-specific semantics
- return only requested changes
