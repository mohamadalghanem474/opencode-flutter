import type { Plugin, Hooks } from "@opencode-ai/plugin"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"

import { loadPluginConfig } from "./plugin-config"
import { createManagers } from "./create-managers"
import { createTools } from "./create-tools"
import { createHooks } from "./create-hooks"
import { createPluginInterface } from "./plugin-interface"
import { createPluginDispose, type PluginDispose } from "./plugin-dispose"
import {
    PLUGIN_NAME,
    PLUGIN_VERSION,
    CONFIG_DIR,
    VERSION_FILE,
    log,
    mergeDefaults,
    readJson,
    syncConfigFiles,
    writeVersionMarker,
    readInstalledVersion,
} from "./shared/index"
import { OPENCODE_DEFAULTS, COMPANION_PLUGINS } from "./config/defaults"
import { join } from "path"

// ---------------------------------------------------------------------------
// opencode-flutter — production-grade OpenCode plugin for Flutter workflows
// ---------------------------------------------------------------------------
// Init pipeline:
//   loadPluginConfig → createManagers → createTools → createHooks
//   → createPluginInterface → return plugin interface
// ---------------------------------------------------------------------------

let activePluginDispose: PluginDispose | null = null

const OpenCodeFlutterPlugin = async (ctx: any) => {
    const { client, $ } = ctx

    await log(client, "info", `[OpenCodeFlutterPlugin] ENTRY — plugin loading (directory: ${ctx.directory})`)

    // ── Dispose previous instance (hot-reload safety) ─────────────────────
    await activePluginDispose?.()

    // ── 1. File sync — copy bundled config files to ~/.config/opencode/ ───
    const configRoot = resolve(
        dirname(import.meta.url.replace("file://", "")),
        "..",
        "config",
    )
    const installedVersion = readInstalledVersion()
    const needsSync = installedVersion !== PLUGIN_VERSION
    const isFirstRun = installedVersion === null

    if (needsSync) {
        const { synced, errors } = syncConfigFiles(
            configRoot,
            ["agents", "commands", "skills"],
            ["AGENTS.md"],
        )

        if (errors.length > 0) {
            await log(client, "error", `File sync errors: ${errors.join("; ")}`)
        }

        if (synced.length > 0) {
            writeVersionMarker()
            await log(
                client,
                "info",
                `Synced config files (v${PLUGIN_VERSION}): ${synced.join(", ")}${isFirstRun ? " — restart OpenCode to activate agents and commands" : ""}`,
            )
        }
    }

    // ── 2. First-run config merge into opencode.json ──────────────────────
    if (isFirstRun) {
        try {
            const configPath = join(CONFIG_DIR, "opencode.json")
            const existing = readJson(configPath)

            if (!existing["$schema"]) {
                existing["$schema"] = "https://opencode.ai/config.json"
            }

            mergeDefaults(existing, OPENCODE_DEFAULTS)

            // Ensure companion plugins are in the plugin array
            const pluginList = (existing.plugin ?? []) as string[]
            for (const p of COMPANION_PLUGINS) {
                if (!pluginList.includes(p)) {
                    pluginList.push(p)
                }
            }
            existing.plugin = pluginList

            writeFileSync(configPath, JSON.stringify(existing, null, 2) + "\n", "utf-8")
            await log(client, "info", "First-run config merge complete. Restart OpenCode to activate all agents and commands.")
        } catch (err) {
            await log(client, "error", `Config merge failed: ${err}`)
        }
    }

    // ── 3. Load plugin config (JSONC, user + project merge, validate) ─────
    const pluginConfig = loadPluginConfig(ctx.directory)

    // ── 4. Create managers ────────────────────────────────────────────────
    const managers = createManagers({ pluginConfig })

    // ── 5. Create tools ───────────────────────────────────────────────────
    const toolsResult = createTools({
        ctx: { directory: ctx.directory, client, $ },
        pluginConfig,
        managers,
    })

    // ── 6. Create hooks ──────────────────────────────────────────────────
    const hooks = createHooks({
        ctx: { directory: ctx.directory, client },
        pluginConfig,
    })

    // ── 7. Create plugin dispose ──────────────────────────────────────────
    const dispose = createPluginDispose({
        backgroundManager: managers.backgroundManager,
        skillMcpManager: managers.skillMcpManager,
        disposeHooks: hooks.disposeHooks,
    })
    activePluginDispose = dispose

    // ── 8. Assemble plugin interface ─────────────────────────────────────
    const pluginInterface = createPluginInterface({
        ctx: { directory: ctx.directory, client, $ },
        pluginConfig,
        managers,
        hooks,
        tools: toolsResult,
    })

    // ── 9. Startup log ────────────────────────────────────────────────────
    await log(
        client,
        "info",
        `Flutter plugin active (v${PLUGIN_VERSION})${needsSync ? " — files synced" : ""} | ${Object.keys(toolsResult.filteredTools).length} tools | ${toolsResult.availableCategories.length} categories`,
    )

    return {
        name: PLUGIN_NAME,
        ...pluginInterface,
    }
}

export default OpenCodeFlutterPlugin

// Named export for backward compatibility
export { OpenCodeFlutterPlugin as OpenCodeFlutter }

// Type re-exports
export type {
    OpenCodeFlutterConfig,
    AgentName,
    AgentOverrideConfig,
    CategoryName,
    CategoryConfig,
    HookName,
    BuiltinCommandName,
    McpName,
} from "./config/index"

export type { ConfigLoadError, ConfigValidationError } from "./shared/config-errors"
