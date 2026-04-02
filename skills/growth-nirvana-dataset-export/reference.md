# Reference: Observed Export Trial

## Successful Trial

- Dataset: `005 - Mart - Deepgram` (`dataset_id: 20189`)
- Export: `bundle_export_id: 2`
- Job: `81d0626aa9b80c31cc7c4410`
- Status: `success`
- File: `dataset_20189_bundle_2.zip`
- Size: `963396` bytes
- SHA256: `009c589870fa747d4abd3d552cdf0d7639d8c39d2474c0f5bfa52635470609f5`
- Storage path: `mcp_exports/datasets/20189/dataset_20189_bundle_2.zip`

## Local Paths Used

- Zip: `downloads/growth-nirvana/exports/20189/dataset_20189_bundle_2.zip`
- Extract root: `downloads/growth-nirvana/exports/20189/unzipped/dataset_20189_20260330143119/`
- Manifest: `downloads/growth-nirvana/exports/20189/unzipped/dataset_20189_20260330143119/manifest.json`

## Artifact Inventory (from trial)

- SQL files: `60`
- YAML files: `1`
- YML files: `0`

## Known Failure Mode

- Error: `Account bucket is not configured`
- Effect: export reaches terminal `failed` and returns no `downloadUrl`
- Fix: configure account bucket, then rerun `create_dataset_bundle_export`
