# Examples

## Example: Channels used by client

Prompt:
`what channels is 005 - Mart - Deepgram using?`

Expected:
- selects appropriate model variant
- returns channel list + evidence from model SQL/config

## Example: Spend by channel (executed)

Prompt:
`for 005 - Mart - CrowdStrike, spend by channel for Feb 2026`

Expected output includes:
- selected model/table
- query execution id
- rows returned

## Example: CPC + CTR

Prompt:
`for Deepgram Feb 2026, give CTR and CPC by channel`

Expected output includes:
- validated fields (`_cost`, `_clicks`, `_impressions`)
- channel metrics table

## Example: No-row diagnosis

Prompt:
`for Traeger Feb 2026 show spend by channel`

Expected:
- no rows found
- follow-up monthly coverage query and last month with spend
