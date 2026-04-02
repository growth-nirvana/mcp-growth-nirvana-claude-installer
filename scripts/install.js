#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const DEFAULT_SERVER_NAME = "growth-nirvana";
const DEFAULT_SERVER_PACKAGE = "growth-nirvana-mcp-server";
const packageRoot = path.resolve(__dirname, "..");

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

if (command === "add-skills") {
  handleAddSkills(args.slice(1));
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

  console.log(`Updated MCP config:`);
  console.log(`  ${configPath}`);
  console.log("");
  console.log(`Added server "${serverName}" using package "${serverPackage}".`);
  console.log("");
  console.log("Next steps:");
  console.log("1) Set GROWTH_NIRVANA_API_KEY in your editor/runtime environment.");
  console.log("2) Reload your editor so MCP config is re-read.");
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

function handleAddSkills(commandArgs) {
  const sourceSkillsDir = path.join(packageRoot, "skills");
  if (!fs.existsSync(sourceSkillsDir)) {
    console.error(`Skills source directory not found: ${sourceSkillsDir}`);
    process.exit(1);
  }

  const globalInstall = commandArgs.includes("--global");
  const explicitTarget = getOptionValue(commandArgs, "--target");
  const targetDir = resolveSkillsTarget(globalInstall, explicitTarget);
  ensureDirectory(targetDir);

  const skillFolders = fs
    .readdirSync(sourceSkillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const skillName of skillFolders) {
    const sourcePath = path.join(sourceSkillsDir, skillName);
    const destinationPath = path.join(targetDir, skillName);
    fs.cpSync(sourcePath, destinationPath, { recursive: true, force: true });
  }

  console.log(`Installed ${skillFolders.length} skill(s) to:`);
  console.log(`  ${targetDir}`);
  console.log("");
  console.log("Installed skills:");
  for (const skillName of skillFolders) {
    console.log(`- ${skillName}`);
  }
}

function resolveConfigPath(explicitPath) {
  if (explicitPath) {
    return path.resolve(process.cwd(), explicitPath);
  }

  // Editor-agnostic default: project-local MCP config.
  return path.join(process.cwd(), ".mcp.json");
}

function resolveSkillsTarget(globalInstall, explicitTarget) {
  if (explicitTarget) {
    return path.resolve(process.cwd(), explicitTarget);
  }

  if (globalInstall) {
    return path.join(os.homedir(), ".claude", "skills");
  }

  return path.join(process.cwd(), ".claude", "skills");
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
  console.log("Growth Nirvana Claude MCP + Skills Installer");
  console.log("");
  console.log("Usage:");
  console.log("  gn-claude-mcp init [--config <path>] [--server-name <name>] [--force] [--pin-server-version <version>]");
  console.log("  gn-claude-mcp remove [--config <path>] [--server-name <name>]");
  console.log("  gn-claude-mcp add-skills [--global] [--target <path>]");
  console.log("");
  console.log("Examples:");
  console.log("  npx @growthnirvana/claude-mcp-installer init");
  console.log("  npx @growthnirvana/claude-mcp-installer init --force");
  console.log("  npx @growthnirvana/claude-mcp-installer init --config .mcp.json");
  console.log("  npx @growthnirvana/claude-mcp-installer init --pin-server-version 1.2.3");
  console.log("  npx @growthnirvana/claude-mcp-installer remove");
  console.log("  npx @growthnirvana/claude-mcp-installer add-skills");
  console.log("  npx @growthnirvana/claude-mcp-installer add-skills --global");
}
