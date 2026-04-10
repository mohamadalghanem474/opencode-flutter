// ---------------------------------------------------------------------------
// opencode-flutter postinstall — register plugin + create default config
// ---------------------------------------------------------------------------

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const PLUGIN_NAME = "@alghanem/opencode-flutter";
const MIN_OPENCODE_VERSION = "1.4.0";
const CONFIG_DIR = join(homedir(), ".config", "opencode");
const SCHEMA_URL =
  "https://raw.githubusercontent.com/mohamadalghanem474/opencode-flutter/main/assets/opencode-flutter.schema.json";

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1;
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1;
  }
  return 0;
}

// ── 1. OpenCode version check ─────────────────────────────────────────────
try {
  const raw = execSync("opencode --version", {
    encoding: "utf-8",
    timeout: 10000,
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
  const version = raw.replace(/^v/, "");

  if (compareVersions(version, MIN_OPENCODE_VERSION) < 0) {
    console.warn(
      `\x1b[33m[${PLUGIN_NAME}] Warning: OpenCode v${version} detected. Minimum recommended: v${MIN_OPENCODE_VERSION}\x1b[0m`,
    );
  } else {
    console.log(`[${PLUGIN_NAME}] OpenCode v${version} detected. ✓`);
  }
} catch {
  // OpenCode not found — that's fine, user may install it later
}

// ── 2. Auto-register plugin in opencode.json ──────────────────────────────
try {
  const jsonPath = join(CONFIG_DIR, "opencode.json");
  const jsoncPath = join(CONFIG_DIR, "opencode.jsonc");
  const configPath = existsSync(jsoncPath) ? jsoncPath : jsonPath;

  mkdirSync(CONFIG_DIR, { recursive: true });

  let config = {};
  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, "utf-8");
      const stripped = raw
        .replace(/^\s*\/\/.*$/gm, "")
        .replace(/,(\s*[}\]])/g, "$1");
      config = JSON.parse(stripped);
    } catch {
      console.log(
        `[${PLUGIN_NAME}] Could not parse ${configPath}, skipping auto-register.`,
      );
      process.exit(0);
    }
  }

  const pluginList = config.plugin ?? [];
  const isRegistered = pluginList.some((p) => {
    const name = typeof p === "string" ? p : Array.isArray(p) ? p[0] : "";
    return name === PLUGIN_NAME || name.includes(PLUGIN_NAME);
  });

  if (!isRegistered) {
    pluginList.push(PLUGIN_NAME);
    config.plugin = pluginList;
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
    console.log(`[${PLUGIN_NAME}] Registered in ${configPath}. ✓`);
  } else {
    console.log(`[${PLUGIN_NAME}] Already registered. ✓`);
  }
} catch (err) {
  console.warn(
    `\x1b[33m[${PLUGIN_NAME}] Auto-register skipped: ${err.message ?? err}\x1b[0m`,
  );
}

// ── 3. Create default plugin config if missing ────────────────────────────
try {
  const pluginConfigPath = join(CONFIG_DIR, "opencode-flutter.json");

  if (!existsSync(pluginConfigPath) || readFileSync(pluginConfigPath, "utf-8").trim() === "") {
    const defaultConfig = {
      $schema: SCHEMA_URL,
      agents: {},
      categories: {},
      disabled_hooks: [],
      disabled_tools: [],
      disabled_skills: [],
      disabled_commands: [],
      disabled_agents: [],
      experimental: {
        task_system: false,
      },
    };

    writeFileSync(
      pluginConfigPath,
      JSON.stringify(defaultConfig, null, 2) + "\n",
      "utf-8",
    );
    console.log(`[${PLUGIN_NAME}] Created ${pluginConfigPath}. ✓`);
  } else {
    console.log(`[${PLUGIN_NAME}] Config exists: ${pluginConfigPath}. ✓`);
  }
} catch (err) {
  console.warn(
    `\x1b[33m[${PLUGIN_NAME}] Config creation skipped: ${err.message ?? err}\x1b[0m`,
  );
}
