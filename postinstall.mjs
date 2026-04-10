// ---------------------------------------------------------------------------
// opencode-flutter postinstall — version check + auto-register in opencode.json
// ---------------------------------------------------------------------------

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";

const PLUGIN_NAME = "opencode-flutter";
const MIN_OPENCODE_VERSION = "1.4.0";
const CONFIG_DIR = join(homedir(), ".config", "opencode");

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
  console.warn(
    `\x1b[33m[${PLUGIN_NAME}] Warning: Could not detect OpenCode version. Make sure opencode is installed.\x1b[0m`,
  );
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
      // Can't parse — don't clobber the file
      console.log(`[${PLUGIN_NAME}] Could not parse ${configPath}, skipping auto-register.`);
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
    console.log(
      `[${PLUGIN_NAME}] Registered in ${configPath}. Restart OpenCode to activate.`,
    );
  } else {
    console.log(`[${PLUGIN_NAME}] Already registered in ${configPath}. ✓`);
  }
} catch (err) {
  // Non-fatal — don't break npm install
  console.warn(
    `\x1b[33m[${PLUGIN_NAME}] Auto-register skipped: ${err.message ?? err}\x1b[0m`,
  );
}
