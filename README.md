# Growth Nirvana Claude MCP Installer

Install and maintain a ready-to-run MCP server entry for Claude Desktop with one command.

## Why this is the best install UX

- Users do not clone repos or edit JSON manually.
- `npx` always runs the latest installer (or a pinned version).
- Installer updates `claude_desktop_config.json` safely, preserving other MCP servers.
- Works as a repeatable command for onboarding and support.

## Quick Start (Claude Desktop)

```bash
npx @growthnirvana/claude-mcp-installer init
```

This adds an MCP server entry named `growth-nirvana` in Claude Desktop config:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `~/AppData/Roaming/Claude/claude_desktop_config.json`

Then fully quit and reopen Claude Desktop.

## Commands

```bash
npx @growthnirvana/claude-mcp-installer init
npx @growthnirvana/claude-mcp-installer init --force
npx @growthnirvana/claude-mcp-installer init --pin-server-version 1.2.3
npx @growthnirvana/claude-mcp-installer remove
```

## Options

- `--config <path>`: custom config file path
- `--server-name <name>`: MCP server key (default: `growth-nirvana`)
- `--force`: overwrite existing server entry when running `init`
- `--pin-server-version <version>`: pin `growth-nirvana-mcp-server` version

## API Key

The installer writes `GROWTH_NIRVANA_API_KEY` into the Claude config from your current environment if present.
If not present, it writes:

```text
REPLACE_WITH_GROWTH_NIRVANA_API_KEY
```

Replace that value in `claude_desktop_config.json` before starting MCP in Claude.

## Releasing (Assumes `v1.0.0` already exists)

Use this flow for every release after `v1.0.0` so npm version, git tag, and GitHub stay in sync.

```bash
# 1) Ensure working tree is clean
git status

# 2) Commit any non-release edits
git add .
git commit -m "chore: prepare release"

# 3) Bump version and create release commit + tag together
# (from v1.0.0 this creates v1.0.1)
npm version patch -m "release: v%s"

# 4) Publish that version to npm
npm publish --access public

# 5) Push commits and tags to GitHub
git push origin main --follow-tags
```

Notes:

- Do not manually create release tags when using `npm version`.
- If `v1.0.0` is already on npm and GitHub, the next patch release should be `v1.0.1`.
