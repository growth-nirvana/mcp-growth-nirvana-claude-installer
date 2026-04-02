# Troubleshooting

## Dry run fails with missing columns

- Verify source model output columns in bundle metadata.
- Align aliases with existing model conventions.

## Liquid/template errors

- Compare variable names against neighboring model SQL.
- Ensure variant-specific variables are present in config.

## Semantic drift in custom variants

- Re-read current variant SQL (`combined_report_ff`, `combined_report_catalog`).
- Preserve channel remaps and taxonomy logic unless intentionally changing them.

## Validation passes but logic is suspicious

- Run targeted diagnostic queries on impacted fields.
- Add assumptions and caveats in final handoff note.
