---
name: growth-nirvana-dataset-export
description: Export a Growth Nirvana dataset bundle zip and validate manifest, SQL, and YAML artifacts. Use when the user asks to run create_dataset_bundle_export/get_dataset_bundle_export, download dataset bundles, or document export output paths and inventory.
---

# Growth Nirvana Dataset Bundle Export

## Purpose

Run the dataset bundle export end-to-end and return a consistent, auditable summary.

## Required Workflow

1. Resolve the target dataset with `search_datasets` (prefer exact `displayName` match when multiple results exist).
2. Start an export with `create_dataset_bundle_export` using:
   - `account_id: self`
   - `dataset_id`
   - a unique `idempotency_key`
3. Poll with `get_dataset_bundle_export` until `terminal: true`.
4. If `status: success`, capture:
   - `bundle_export_id`
   - `jobId`
   - `fileName`
   - `byteSize`
   - `checksumSha256`
   - `downloadUrl`
   - `downloadUrlExpiresAt`
   - `storagePath`
5. Download the zip into:
   - `downloads/growth-nirvana/exports/<dataset_id>/<fileName>`
6. Verify checksum against `checksumSha256`.
7. Extract into:
   - `downloads/growth-nirvana/exports/<dataset_id>/unzipped/`
8. Validate expected artifacts:
   - `manifest.json`
   - `*.sql` files
   - `*.yaml` or `*.yml` files

## Failure Handling

- If export fails, report exact terminal payload fields:
  - `status`
  - `errorMessage`
  - `bundle_export_id`
  - `jobId`
- If error contains `Account bucket is not configured`, instruct user to configure account bucket storage, then rerun `create_dataset_bundle_export`.
- If `downloadUrl` is expired, rerun `get_dataset_bundle_export` to refresh URL or create a new export.

## Response Contract

Always return:

- Dataset name/id
- Export id and job id
- Final status
- Zip path
- Unzip path
- Manifest path
- SQL file count
- YAML/YML file count
- Checksum match (`true`/`false`)
- Any warnings or remediation steps

## Additional Resources

- Real trial payload and paths: [reference.md](reference.md)
