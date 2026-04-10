import type { CreatedHooks } from "./create-hooks"
import type { Managers } from "./create-managers"

// ---------------------------------------------------------------------------
// Plugin disposal — sequential cleanup of managers, hooks, MCP connections
// ---------------------------------------------------------------------------

export type PluginDispose = () => Promise<void>

interface CreatePluginDisposeDeps {
    backgroundManager: Managers["backgroundManager"]
    skillMcpManager: Managers["skillMcpManager"]
    disposeHooks: CreatedHooks["disposeHooks"]
}

export function createPluginDispose(deps: CreatePluginDisposeDeps): PluginDispose {
    const { backgroundManager, skillMcpManager, disposeHooks } = deps
    let disposePromise: Promise<void> | null = null

    return async () => {
        // Idempotent: only run once, await if already in progress
        if (disposePromise) {
            await disposePromise
            return
        }

        disposePromise = (async () => {
            // 1. Shutdown background tasks
            try {
                await backgroundManager?.shutdown()
            } catch (err) {
                console.error("[opencode-flutter] Background manager shutdown error:", err)
            }

            // 2. Disconnect skill MCP servers
            try {
                await skillMcpManager.disconnectAll()
            } catch (err) {
                console.error("[opencode-flutter] Skill MCP disconnect error:", err)
            }

            // 3. Dispose hooks
            try {
                disposeHooks()
            } catch (err) {
                console.error("[opencode-flutter] Hook dispose error:", err)
            }
        })()

        await disposePromise
    }
}
