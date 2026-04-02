#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const DEFAULT_SERVER_NAME = "growth-nirvana";
const DEFAULT_SERVER_PACKAGE = "growth-nirvana-mcp-server";
const DEFAULT_CONFIG_PATH_MAC = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Claude",
  "claude_desktop_config.json"
);
const DEFAULT_CONFIG_PATH_WIN = path.join(
  os.homedir(),
  "AppData",
  "Roaming",
  "Claude",
  "claude_desktop_config.json"
);

const args = process.argv.slice(2);
const command = args[0] || "init";

if (command === "--help" || command === "-h" || command === "help") {
  printHelp();
  process.exit(0);
}

if (command === "init") {
  handleInit(args.slice(1));
  process.exit(0);
}

if (command === "remove") {
  handleRemove(args.slice(1));
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printHelp();
process.exit(1);

function handleInit(commandArgs) {
  const configPath = resolveConfigPath(getOptionValue(commandArgs, "--config"));
  const force = commandArgs.includes("--force");
  const serverName = getOptionValue(commandArgs, "--server-name") || DEFAULT_SERVER_NAME;
  const pinnedVersion = getOptionValue(commandArgs, "--pin-server-version");
  const serverPackage = pinnedVersion
    ? `${DEFAULT_SERVER_PACKAGE}@${pinnedVersion}`
    : DEFAULT_SERVER_PACKAGE;

  const config = readJsonMaybe(configPath) || {};
  if (!config.mcpServers || typeof config.mcpServers !== "object") {
    config.mcpServers = {};
  }

  if (config.mcpServers[serverName] && !force) {
    console.error(`Server "${serverName}" already exists in:`);
    console.error(`  ${configPath}`);
    console.error("Use --force to overwrite.");
    process.exit(1);
  }

  config.mcpServers[serverName] = {
    command: "npx",
    args: ["-y", serverPackage],
    env: {
      GROWTH_NIRVANA_BASE_URL:
        process.env.GROWTH_NIRVANA_BASE_URL || "https://app.growthnirvana.com",
      GROWTH_NIRVANA_TIMEOUT_MS: process.env.GROWTH_NIRVANA_TIMEOUT_MS || "15000",
      GROWTH_NIRVANA_MAX_RETRIES: process.env.GROWTH_NIRVANA_MAX_RETRIES || "3"
    }
  };

  ensureDirectory(path.dirname(configPath));
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");

  console.log(`Updated Claude MCP config:`);
  console.log(`  ${configPath}`);
  console.log("");
  console.log(`Added server "${serverName}" using package "${serverPackage}".`);
  console.log("");
  console.log("Next steps:");
  console.log("1) Set GROWTH_NIRVANA_API_KEY in Claude's app environment (launchctl on macOS).");
  console.log("2) Fully quit and reopen Claude Desktop.");
}

function handleRemove(commandArgs) {
  const configPath = resolveConfigPath(getOptionValue(commandArgs, "--config"));
  const serverName = getOptionValue(commandArgs, "--server-name") || DEFAULT_SERVER_NAME;
  const config = readJsonMaybe(configPath);

  if (!config || !config.mcpServers || !config.mcpServers[serverName]) {
    console.log(`No server named "${serverName}" found in:`);
    console.log(`  ${configPath}`);
    return;
  }

  delete config.mcpServers[serverName];
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  console.log(`Removed server "${serverName}" from:`);
  console.log(`  ${configPath}`);
}

function resolveConfigPath(explicitPath) {
  if (explicitPath) {
    return path.resolve(process.cwd(), explicitPath);
  }

  if (process.platform === "darwin") {
    return DEFAULT_CONFIG_PATH_MAC;
  }

  if (process.platform === "win32") {
    return DEFAULT_CONFIG_PATH_WIN;
  }

  return path.join(os.homedir(), ".config", "Claude", "claude_desktop_config.json");
}

function readJsonMaybe(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error(`Failed to parse JSON file: ${filePath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function getOptionValue(commandArgs, flag) {
  const optionIndex = commandArgs.findIndex((arg) => arg === flag);
  if (optionIndex < 0) {
    return null;
  }

  const optionValue = commandArgs[optionIndex + 1];
  if (!optionValue) {
    console.error(`Missing value for ${flag}`);
    process.exit(1);
  }

  return optionValue;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function printHelp() {
  console.log("Growth Nirvana Claude MCP Installer");
  console.log("");
  console.log("Usage:");
  console.log("  gn-claude-mcp init [--config <path>] [--server-name <name>] [--force] [--pin-server-version <version>]");
  console.log("  gn-claude-mcp remove [--config <path>] [--server-name <name>]");
  console.log("");
  console.log("Examples:");
  console.log("  npx @growthnirvana/claude-mcp-installer init");
  console.log("  npx @growthnirvana/claude-mcp-installer init --force");
  console.log("  npx @growthnirvana/claude-mcp-installer init --pin-server-version 1.2.3");
  console.log("  npx @growthnirvana/claude-mcp-installer remove");
}
