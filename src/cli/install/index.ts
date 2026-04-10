import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, dirname } from "path"
import pc from "picocolors"
import {
    PLUGIN_NAME,
    PLUGIN_VERSION,
    CONFIG_DIR,
    readJson,
} from "../../shared/index"
import { COMPANION_PLUGINS } from "../../config/defaults"

// ---------------------------------------------------------------------------
// opencode-flutter install — one-command setup, like oh-my-openagent
// ---------------------------------------------------------------------------

export interface InstallOptions {
    noTui: boolean
    force: boolean
}

const OPENCODE_JSON_PATH = join(CONFIG_DIR, "opencode.json")
const OPENCODE_JSONC_PATH = join(CONFIG_DIR, "opencode.jsonc")

function getConfigPath(): string {
    if (existsSync(OPENCODE_JSONC_PATH)) return OPENCODE_JSONC_PATH
    if (existsSync(OPENCODE_JSON_PATH)) return OPENCODE_JSON_PATH
    return OPENCODE_JSON_PATH
}

function readOpenCodeConfig(configPath: string): Record<string, unknown> {
    if (!existsSync(configPath)) return {}
    try {
        const raw = readFileSync(configPath, "utf-8")
        // Strip single-line comments for JSONC support
        const stripped = raw.replace(/^\s*\/\/.*$/gm, "").replace(/,(\s*[}\]])/g, "$1")
        return JSON.parse(stripped)
    } catch {
        return readJson(configPath)
    }
}

function writeOpenCodeConfig(configPath: string, config: Record<string, unknown>) {
    mkdirSync(dirname(configPath), { recursive: true })
    writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8")
}

export async function runInstall(opts: InstallOptions): Promise<void> {
    console.log(pc.bold(`\n  ${PLUGIN_NAME} installer v${PLUGIN_VERSION}\n`))

    const configPath = getConfigPath()
    const config = readOpenCodeConfig(configPath)
    let changed = false

    // ── Step 1: Register plugin in opencode.json ──────────────────────────
    console.log(pc.dim("  Step 1: Register plugin"))

    const pluginList = (config.plugin ?? []) as Array<string | [string, unknown]>
    const isRegistered = pluginList.some((p) => {
        const name = typeof p === "string" ? p : p[0]
        return name === PLUGIN_NAME || name.includes(PLUGIN_NAME)
    })

    if (!isRegistered) {
        pluginList.push(PLUGIN_NAME)
        config.plugin = pluginList
        changed = true
        console.log(pc.green(`    ✓ Added "${PLUGIN_NAME}" to plugin array`))
    } else {
        console.log(pc.dim(`    ✓ Already registered`))
    }

    // ── Step 2: Register companion plugins ────────────────────────────────
    console.log(pc.dim("  Step 2: Companion plugins"))

    for (const companion of COMPANION_PLUGINS) {
        const exists = pluginList.some((p) => {
            const name = typeof p === "string" ? p : p[0]
            return name === companion
        })
        if (!exists) {
            pluginList.push(companion)
            changed = true
            console.log(pc.green(`    ✓ Added "${companion}"`))
        } else {
            console.log(pc.dim(`    ✓ ${companion} already present`))
        }
    }
    config.plugin = pluginList

    // ── Step 3: (Defaults injected at runtime via config hook) ────────────
    console.log(pc.dim("  Step 3: Flutter defaults"))
    console.log(pc.green("    ✓ All defaults injected at runtime via plugin config hook (not written to opencode.json)"))

    if (!config["$schema"]) {
        config["$schema"] = "https://opencode.ai/config.json"
        changed = true
    }

    // ── Step 4: Write opencode.json ───────────────────────────────────────
    if (changed) {
        writeOpenCodeConfig(configPath, config)
        console.log(pc.green(`    ✓ Saved ${configPath}`))
    }

    // ── Step 5: (Agents/commands injected at runtime via config hook) ────
    console.log(pc.dim("  Step 5: Agents & commands"))
    console.log(pc.green("    ✓ Injected at runtime via plugin config hook (no file copying)"))

    // ── Step 6: Create project-level config (if in a project dir) ─────────
    const projectOpencodeDir = join(process.cwd(), ".opencode")
    const projectConfig = join(projectOpencodeDir, "opencode-flutter.jsonc")

    if (!existsSync(projectConfig) || opts.force) {
        console.log(pc.dim("  Step 6: Project config"))
        mkdirSync(projectOpencodeDir, { recursive: true })
        writeFileSync(
            projectConfig,
            `{
  // opencode-flutter project-level config
  // Overrides user-level config in ~/.config/opencode/opencode-flutter.jsonc
  "$schema": "./node_modules/@alghanem/opencode-flutter/dist/opencode-flutter.schema.json",

  "agents": {},
  "categories": {},
  "disabled_hooks": [],
  "disabled_tools": [],
  "disabled_skills": [],
  "disabled_commands": [],

  "experimental": {
    "task_system": false
  }
}
`,
            "utf-8",
        )
        console.log(pc.green(`    ✓ Created ${projectConfig}`))
    }

    // ── Summary ───────────────────────────────────────────────────────────
    console.log()
    console.log(pc.bold(pc.green("  Installation complete!")))
    console.log()
    console.log(`  ${pc.dim("Verify:")}    bunx opencode-flutter doctor`)
    console.log(`  ${pc.dim("Configure:")} ${projectConfig}`)
    console.log(`  ${pc.dim("Start:")}     opencode`)
    console.log()
    console.log(pc.dim("  Restart OpenCode if it's already running to load the plugin."))
    console.log()
}
