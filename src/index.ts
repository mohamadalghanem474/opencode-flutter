import type { Plugin, Hooks } from "@opencode-ai/plugin"
import { readFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"

import { loadPluginConfig } from "./plugin-config"
import { createManagers } from "./create-managers"
import { createTools } from "./create-tools"
import { createHooks } from "./create-hooks"
import { createPluginInterface } from "./plugin-interface"
import { createPluginDispose, type PluginDispose } from "./plugin-dispose"
import { createConfigHandler } from "./config-handler"
import {
    PLUGIN_NAME,
    PLUGIN_VERSION,
    log,
} from "./shared/index"

// ---------------------------------------------------------------------------
// opencode-flutter — production-grade OpenCode plugin for Flutter workflows
// ---------------------------------------------------------------------------
// Init pipeline:
//   loadPluginConfig → createManagers → createTools → createHooks
//   → createPluginInterface → return plugin interface (with config hook)
// ---------------------------------------------------------------------------

let activePluginDispose: PluginDispose | null = null

const OpenCodeFlutterPlugin = async (ctx: any) => {
    const { client, $ } = ctx

    await log(client, "info", `[OpenCodeFlutterPlugin] ENTRY — plugin loading (directory: ${ctx.directory})`)

    // ── Dispose previous instance (hot-reload safety) ─────────────────────
    await activePluginDispose?.()

    // ── 1. Load plugin config (JSONC, user + project merge, validate) ─────
    const pluginConfig = loadPluginConfig(ctx.directory)

    // ── 2. Create managers ────────────────────────────────────────────────
    const managers = createManagers({ pluginConfig })

    // ── 3. Create tools ───────────────────────────────────────────────────
    const toolsResult = createTools({
        ctx: { directory: ctx.directory, client, $ },
        pluginConfig,
        managers,
    })

    // ── 4. Create hooks ──────────────────────────────────────────────────
    const hooks = createHooks({
        ctx: { directory: ctx.directory, client },
        pluginConfig,
    })

    // ── 5. Create plugin dispose ──────────────────────────────────────────
    const dispose = createPluginDispose({
        backgroundManager: managers.backgroundManager,
        skillMcpManager: managers.skillMcpManager,
        disposeHooks: hooks.disposeHooks,
    })
    activePluginDispose = dispose

    // ── 6. Create config handler (injects agents, commands, defaults) ─────
    const configHandler = createConfigHandler({ pluginConfig })

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
        `Flutter plugin active (v${PLUGIN_VERSION}) | ${Object.keys(toolsResult.filteredTools).length} tools | ${toolsResult.availableCategories.length} categories`,
    )

    return {
        name: PLUGIN_NAME,
        config: configHandler,
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
