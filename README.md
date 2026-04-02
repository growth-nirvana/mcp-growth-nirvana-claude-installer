# Growth Nirvana Claude MCP Installer

Install and maintain a ready-to-run MCP server entry for Claude Code/editor workflows with one command.

## Why this is the best install UX

- Users do not clone repos or edit JSON manually.
- `npx` always runs the latest installer (or a pinned version).
- Installer updates a project-local `.mcp.json` safely, preserving other MCP servers.
- Works as a repeatable command for onboarding and support.

## Quick Start (Project-local MCP config)

```bash
npx @growthnirvana/claude-mcp-installer init
```

This adds an MCP server entry named `growth-nirvana` to:

- `./.mcp.json` (project root)

Then reload your editor (VS Code/Cursor/Claude Code) so MCP config is re-read.

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

The installer does **not** write `GROWTH_NIRVANA_API_KEY` into `.mcp.json`.
Your editor/runtime starts MCP servers as child processes, and those processes inherit runtime environment variables.
So the key is read at runtime from environment variables available to your editor session.

## Security Best Practices

- Do not commit secret values in repo-local config files.
- If you use project-local MCP config, add it to `.gitignore` when it may contain secrets.
- Keep API keys in environment variables, not JSON config.

Suggested `.gitignore` entries:

```gitignore
# MCP config files (may contain secrets)
mcp.json
.mcp.json
.cursor/mcp.json
```

## Setting `GROWTH_NIRVANA_API_KEY` Safely

Recommended (per-project shell session):

```bash
export GROWTH_NIRVANA_API_KEY="your_api_key_here"
```

Then start/restart your editor from that shell session.

Check it was set:

```bash
echo "$GROWTH_NIRVANA_API_KEY"
```

Persistent shell profile setup:

```bash
echo 'export GROWTH_NIRVANA_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

How the read path works:

- `.mcp.json` starts the server with `npx -y growth-nirvana-mcp-server`.
- Your editor/runtime passes its environment to that process.
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
