import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs"
import { join, resolve, dirname } from "path"
import pc from "picocolors"
import {
    PLUGIN_NAME,
    PLUGIN_VERSION,
    CONFIG_DIR,
    readJson,
    mergeDefaults,
    copyDirSync,
    writeVersionMarker,
} from "../../shared/index"
import { OPENCODE_DEFAULTS, COMPANION_PLUGINS } from "../../config/defaults"

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

    // ── Step 3: Merge Flutter defaults ────────────────────────────────────
    console.log(pc.dim("  Step 3: Flutter defaults"))

    if (!config["$schema"]) {
        config["$schema"] = "https://opencode.ai/config.json"
    }

    mergeDefaults(config, OPENCODE_DEFAULTS)
    changed = true
    console.log(pc.green("    ✓ Flutter defaults merged (formatter, LSP, watcher, MCP, permissions)"))

    // ── Step 4: Write opencode.json ───────────────────────────────────────
    if (changed) {
        writeOpenCodeConfig(configPath, config)
        console.log(pc.green(`    ✓ Saved ${configPath}`))
    }

    // ── Step 5: Sync agent/command/skill files ────────────────────────────
    console.log(pc.dim("  Step 5: Sync config files"))

    const configRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "config")
    const configRootAlt = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "config")
    const sourceDir = existsSync(configRoot) ? configRoot : existsSync(configRootAlt) ? configRootAlt : null

    if (sourceDir) {
        const dirs = ["agents", "commands", "skills"]
        for (const dir of dirs) {
            const src = join(sourceDir, dir)
            const dest = join(CONFIG_DIR, dir)
            if (existsSync(src)) {
                try {
                    copyDirSync(src, dest)
                    console.log(pc.green(`    ✓ Synced ${dir}/`))
                } catch (err) {
                    console.log(pc.red(`    ✗ Failed to sync ${dir}/: ${err}`))
                }
            }
        }

        // Copy AGENTS.md
        const agentsMdSrc = join(sourceDir, "AGENTS.md")
        const agentsMdDest = join(CONFIG_DIR, "AGENTS.md")
        if (existsSync(agentsMdSrc)) {
            try {
                const { copyFileSync } = await import("fs")
                copyFileSync(agentsMdSrc, agentsMdDest)
                console.log(pc.green("    ✓ Synced AGENTS.md"))
            } catch (err) {
                console.log(pc.red(`    ✗ Failed to sync AGENTS.md: ${err}`))
            }
        }

        writeVersionMarker()
    } else {
        console.log(pc.yellow("    ! Config source not found — files will sync on first OpenCode start"))
    }

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
  "$schema": "./node_modules/opencode-flutter/dist/opencode-flutter.schema.json",

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

// Inline import for ESM compat
import { fileURLToPath } from "url"
