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

The installer does **not** write `GROWTH_NIRVANA_API_KEY` into `claude_desktop_config.json`.
Claude starts MCP servers as child processes, and those processes inherit Claude's app environment.
So the key is read at runtime from environment variables available to Claude Desktop.

## Security Best Practices

- Do not commit MCP config files that may contain secrets.
- Prefer user-level Claude config (outside your repo) over project-local config.
- If you use a repo-local config with `--config`, add MCP files to `.gitignore`.

Suggested `.gitignore` entries:

```gitignore
# MCP config files (may contain secrets)
mcp.json
.mcp.json
.cursor/mcp.json
claude_desktop_config.json
```

## Setting `GROWTH_NIRVANA_API_KEY` Safely

Recommended (macOS, persistent for GUI apps like Claude/VS Code):

```bash
launchctl setenv GROWTH_NIRVANA_API_KEY "your_api_key_here"
```

Then fully quit and reopen Claude Desktop (and VS Code if needed).

Check it was set:

```bash
launchctl getenv GROWTH_NIRVANA_API_KEY
```

Fallback (shell-only sessions):

```bash
echo 'export GROWTH_NIRVANA_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

How the read path works:

- `claude_desktop_config.json` starts the server with `npx -y growth-nirvana-mcp-server`.
- Claude passes its environment to that process.
- The server reads `GROWTH_NIRVANA_API_KEY` from that inherited environment.

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
