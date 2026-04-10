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
    syncConfigFiles,
    writeVersionMarker,
    readInstalledVersion,
} from "./shared/index"

// ---------------------------------------------------------------------------
// opencode-flutter — production-grade OpenCode plugin for Flutter workflows
// ---------------------------------------------------------------------------
// Init pipeline:
//   syncConfigFiles → loadPluginConfig → createManagers → createTools
//   → createHooks → createPluginInterface → return plugin interface
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

    if (needsSync && existsSync(configRoot)) {
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
            await log(client, "info", `Synced config files (v${PLUGIN_VERSION}): ${synced.join(", ")}`)
        }
    }

    // ── 2. Load plugin config (JSONC, user + project merge, validate) ─────
    const pluginConfig = loadPluginConfig(ctx.directory)

    // ── 3. Create managers ────────────────────────────────────────────────
    const managers = createManagers({ pluginConfig })

    // ── 4. Create tools ───────────────────────────────────────────────────
    const toolsResult = createTools({
        ctx: { directory: ctx.directory, client, $ },
        pluginConfig,
        managers,
    })

    // ── 5. Create hooks ──────────────────────────────────────────────────
    const hooks = createHooks({
        ctx: { directory: ctx.directory, client },
        pluginConfig,
    })

    // ── 6. Create plugin dispose ──────────────────────────────────────────
    const dispose = createPluginDispose({
        backgroundManager: managers.backgroundManager,
        skillMcpManager: managers.skillMcpManager,
        disposeHooks: hooks.disposeHooks,
    })
    activePluginDispose = dispose

    // ── 7. Assemble plugin interface ─────────────────────────────────────
    const pluginInterface = createPluginInterface({
        ctx: { directory: ctx.directory, client, $ },
        pluginConfig,
        managers,
        hooks,
        tools: toolsResult,
    })

    // ── 8. Startup log ────────────────────────────────────────────────────
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
