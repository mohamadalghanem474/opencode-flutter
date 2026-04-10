import { existsSync } from "fs"
import { dirname } from "path"
import type { OpenCodeFlutterConfig } from "./config/index"
import type { CreatedHooks } from "./create-hooks"
import { collectAgentsMd } from "./create-hooks"
import type { CreateToolsResult, PluginContext } from "./create-tools"
import type { Managers } from "./create-managers"

// ---------------------------------------------------------------------------
// Plugin interface — assembles all OpenCode hook handlers
// ---------------------------------------------------------------------------

interface CreatePluginInterfaceDeps {
    ctx: PluginContext
    pluginConfig: OpenCodeFlutterConfig
    managers: Managers
    hooks: CreatedHooks
    tools: CreateToolsResult
}

export interface PluginInterface {
    tool: Record<string, unknown>
    "tool.execute.before": (input: any, output: any) => Promise<void>
    "tool.execute.after": (input: any, output: any) => Promise<void>
    "experimental.session.compacting": (
        input: { sessionID: string },
        output: { context: string[] },
    ) => Promise<void>
    event?: (input: { event: any }) => Promise<void>
}

export function createPluginInterface(deps: CreatePluginInterfaceDeps): PluginInterface {
    const { ctx, pluginConfig, managers, hooks, tools } = deps

    return {
        // ── Tool registry ─────────────────────────────────────────────────────
        tool: tools.filteredTools,

        // ── PreToolUse handler ────────────────────────────────────────────────
        "tool.execute.before": async (input, output) => {
            // .env file guard
            if (hooks.envFileGuard) {
                if (
                    input.tool === "read" &&
                    typeof output.args?.filePath === "string" &&
                    /\.(env|env\.\w+)$/.test(output.args.filePath)
                ) {
                    throw new Error(
                        "opencode-flutter: Reading .env files is blocked to prevent credential leaks.",
                    )
                }
            }

            // Write-existing-file guard
            if (hooks.writeExistingFileGuard) {
                if (
                    input.tool === "write" &&
                    typeof output.args?.filePath === "string" &&
                    existsSync(output.args.filePath)
                ) {
                    // Inject a warning into output so the agent knows it should read first
                    if (!output.warnings) output.warnings = []
                    output.warnings.push(
                        `File ${output.args.filePath} already exists. Read it first to avoid losing context.`,
                    )
                }
            }

            // Directory AGENTS.md injection on file reads
            if (hooks.directoryAgentsInjector && input.tool === "read") {
                const filePath = output.args?.filePath
                if (typeof filePath === "string") {
                    const agentsContent = collectAgentsMd(filePath, ctx.directory)
                    if (agentsContent.length > 0) {
                        if (!output.systemContext) output.systemContext = []
                        for (const content of agentsContent) {
                            output.systemContext.push(content)
                        }
                    }
                }
            }

            // Keyword detector: detect Flutter-specific intent keywords
            if (hooks.keywordDetector && input.tool === "chat" && typeof output.message === "string") {
                const msg = output.message.toLowerCase()
                const keywords: Record<string, string> = {
                    "flutter analyze": "Run flutter_analyze tool to check for issues",
                    "flutter test": "Run flutter_test tool for test execution",
                    "code gen": "Run flutter_gen tool for code generation",
                    "build runner": "Run flutter_gen tool for code generation",
                    "pub outdated": "Run flutter_deps tool to check dependencies",
                }
                for (const [keyword, hint] of Object.entries(keywords)) {
                    if (msg.includes(keyword)) {
                        if (!output.systemContext) output.systemContext = []
                        output.systemContext.push(`[hint] ${hint}`)
                    }
                }
            }
        },

        // ── PostToolUse handler ───────────────────────────────────────────────
        "tool.execute.after": async (input, output) => {
            // Comment checker on write/edit operations
            if (
                hooks.commentChecker &&
                (input.tool === "write" || input.tool === "edit") &&
                typeof output.result === "string"
            ) {
                const warning = hooks.commentChecker.check(output.result)
                if (warning) {
                    if (!output.warnings) output.warnings = []
                    output.warnings.push(warning)
                }
            }

            // Tool output truncation
            if (hooks.toolOutputTruncator) {
                const truncatableTools = ["grep", "glob", "read", "lsp_diagnostics", "lsp_find_references"]
                if (
                    truncatableTools.includes(input.tool) &&
                    typeof output.result === "string" &&
                    output.result.length > 50000
                ) {
                    output.result =
                        output.result.slice(0, 50000) +
                        "\n\n[... output truncated at 50KB to preserve context window ...]"
                }
            }
        },

        // ── Session compaction ────────────────────────────────────────────────
        "experimental.session.compacting": async (input, output) => {
            if (hooks.compactionContextInjector) {
                await hooks.compactionContextInjector.capture?.(input.sessionID)
                output.context.push(hooks.compactionContextInjector.inject(input.sessionID))
            }
        },

        // ── Event handler ─────────────────────────────────────────────────────
        event: async (input) => {
            const eventType = (input.event as any)?.type ?? input.event
            // Todo continuation enforcer on session idle
            if (eventType === "session.idle" && hooks.todoContinuationEnforcer) {
                hooks.todoContinuationEnforcer.enforce()
            }

            // Session error: attempt recovery
            if (eventType === "session.error") {
                await ctx.client.app.log({
                    body: {
                        service: "opencode-flutter",
                        level: "warn",
                        message: `Session error: ${(input.event as any)?.error ?? "unknown"}`,
                    },
                })
            }
        },
    }
}
