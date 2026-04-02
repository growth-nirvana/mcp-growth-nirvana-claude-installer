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
