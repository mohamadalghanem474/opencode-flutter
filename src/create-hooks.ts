import { readFileSync, existsSync } from "fs"
import { join, resolve, dirname } from "path"
import type { OpenCodeFlutterConfig, HookName } from "./config/index"

// ---------------------------------------------------------------------------
// Hook factory — creates all plugin hooks, gated by disabled_hooks config
// ---------------------------------------------------------------------------

export interface HookContext {
    directory: string
    client: any
}

export interface DisposableHook {
    dispose(): void
}

export interface CreatedHooks {
    // Core
    envFileGuard: boolean
    compactionContextInjector: {
        inject(sessionId: string): string
        capture?(sessionId: string): Promise<void>
    } | null
    directoryAgentsInjector: boolean
    writeExistingFileGuard: boolean
    toolOutputTruncator: boolean

    // Quality
    commentChecker: (DisposableHook & { check(output: string): string | null }) | null

    // Productivity
    keywordDetector: boolean
    todoContinuationEnforcer: (DisposableHook & { enforce(): void }) | null

    // Recovery
    runtimeFallback: DisposableHook | null

    // Dispose all
    disposeHooks(): void
}

interface CreateHooksDeps {
    ctx: HookContext
    pluginConfig: OpenCodeFlutterConfig
}

/** Check if a hook is enabled (not in disabled_hooks list) */
function makeHookEnabler(pluginConfig: OpenCodeFlutterConfig) {
    const disabled = new Set(pluginConfig.disabled_hooks)
    return (name: HookName | string): boolean => !disabled.has(name)
}

export function createHooks(deps: CreateHooksDeps): CreatedHooks {
    const { ctx, pluginConfig } = deps
    const isHookEnabled = makeHookEnabler(pluginConfig)

    const disposables: DisposableHook[] = []

    // ── Core: .env file guard ────────────────────────────────────────────────
    const envFileGuard = isHookEnabled("env-file-guard")

    // ── Core: compaction context injector ────────────────────────────────────
    let compactionContextInjector: CreatedHooks["compactionContextInjector"] = null
    if (isHookEnabled("compaction-context-injector")) {
        const sessionContexts = new Map<string, string[]>()
        compactionContextInjector = {
            async capture(sessionId: string) {
                // Could capture session-specific context here in future
            },
            inject(_sessionId: string): string {
                return `
## Flutter Session Context

When compacting this session, preserve:
- Which Flutter/Dart files were modified and why
- The project's architecture, state management, and routing conventions discovered
- Any pubspec.yaml dependency changes or build_runner regeneration that occurred
- Platform-specific work (Android, iOS, web, desktop) and native config changes
- Test coverage decisions and validation results (dart analyze, flutter test)
- Active risks, blockers, or follow-up items for the current task
`
            },
        }
    }

    // ── Core: directory AGENTS.md injector ───────────────────────────────────
    const directoryAgentsInjector = isHookEnabled("directory-agents-injector")

    // ── Core: write-existing-file guard ─────────────────────────────────────
    const writeExistingFileGuard = isHookEnabled("write-existing-file-guard")

    // ── Core: tool output truncator ──────────────────────────────────────────
    const toolOutputTruncator = isHookEnabled("tool-output-truncator")

    // ── Quality: comment checker ─────────────────────────────────────────────
    let commentChecker: CreatedHooks["commentChecker"] = null
    if (isHookEnabled("comment-checker")) {
        commentChecker = {
            check(output: string): string | null {
                // Count comment lines that look auto-generated
                const lines = output.split("\n")
                const commentLines = lines.filter(
                    (l) =>
                        l.trim().startsWith("//") &&
                        !l.trim().startsWith("// ignore:") &&
                        !l.trim().startsWith("// TODO") &&
                        !l.trim().startsWith("/// "),
                )
                if (commentLines.length > lines.length * 0.15 && commentLines.length > 5) {
                    return "Too many inline comments detected. Flutter convention: prefer self-documenting code with /// doc comments on public APIs only. Remove obvious comments."
                }
                return null
            },
            dispose() { },
        }
        disposables.push(commentChecker)
    }

    // ── Productivity: keyword detector ───────────────────────────────────────
    const keywordDetector = isHookEnabled("keyword-detector")

    // ── Productivity: todo continuation enforcer ─────────────────────────────
    let todoContinuationEnforcer: CreatedHooks["todoContinuationEnforcer"] = null
    if (isHookEnabled("todo-continuation-enforcer")) {
        todoContinuationEnforcer = {
            enforce() {
                // Will be wired to event handler to yank idle agents
            },
            dispose() { },
        }
        disposables.push(todoContinuationEnforcer)
    }

    // ── Recovery: runtime fallback ──────────────────────────────────────────
    let runtimeFallback: DisposableHook | null = null
    if (isHookEnabled("runtime-fallback") && pluginConfig.runtime_fallback.enabled) {
        runtimeFallback = {
            dispose() { },
        }
        disposables.push(runtimeFallback)
    }

    return {
        envFileGuard,
        compactionContextInjector,
        directoryAgentsInjector,
        writeExistingFileGuard,
        toolOutputTruncator,
        commentChecker,
        keywordDetector,
        todoContinuationEnforcer,
        runtimeFallback,
        disposeHooks() {
            for (const d of disposables) {
                try {
                    d.dispose()
                } catch {
                    // Swallow disposal errors
                }
            }
        },
    }
}

// ── AGENTS.md injection helper ─────────────────────────────────────────────

/**
 * Walk from `filePath` up to `projectRoot`, collecting AGENTS.md content
 * at each level (closest to file = highest priority).
 */
export function collectAgentsMd(filePath: string, projectRoot: string): string[] {
    const collected: string[] = []
    let dir = dirname(resolve(filePath))
    const root = resolve(projectRoot)

    while (dir.startsWith(root) || dir === root) {
        const agentsMd = join(dir, "AGENTS.md")
        if (existsSync(agentsMd)) {
            try {
                collected.push(readFileSync(agentsMd, "utf-8"))
            } catch {
                // Skip unreadable files
            }
        }
        const parent = dirname(dir)
        if (parent === dir) break
        dir = parent
    }

    return collected.reverse() // project root first
}
