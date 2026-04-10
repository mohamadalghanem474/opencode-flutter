import type { OpenCodeFlutterConfig } from "./config/index"

// ---------------------------------------------------------------------------
// Manager factory — creates background manager and skill MCP manager
// ---------------------------------------------------------------------------

export interface BackgroundTask {
    agent: string
    prompt: string
}

export interface BackgroundManager {
    enqueue(task: BackgroundTask): string
    getResult(taskId: string): { status: string; result?: unknown; error?: string }
    cancel(taskId: string): { status: string; message: string }
    shutdown(): Promise<void>
}

export interface SkillMcpManager {
    disconnectAll(): Promise<void>
}

export interface Managers {
    backgroundManager: BackgroundManager | null
    skillMcpManager: SkillMcpManager
}

interface CreateManagersDeps {
    pluginConfig: OpenCodeFlutterConfig
}

export function createManagers(deps: CreateManagersDeps): Managers {
    const { pluginConfig } = deps

    // ── Background Manager ─────────────────────────────────────────────────
    let backgroundManager: BackgroundManager | null = null

    const maxConcurrent = pluginConfig.background.max_concurrent
    const tasks = new Map<string, { task: BackgroundTask; status: string; result?: unknown }>()
    let taskCounter = 0

    backgroundManager = {
        enqueue(task: BackgroundTask): string {
            const id = `bg_${++taskCounter}_${Date.now()}`
            tasks.set(id, { task, status: "pending" })
            // In a full implementation, this would spawn a background agent session
            // via ctx.client. For now, we track the task and return the ID
            // so the delegation tool chain works.
            return id
        },

        getResult(taskId: string) {
            const entry = tasks.get(taskId)
            if (!entry) return { status: "not_found", error: `Task ${taskId} not found` }
            return { status: entry.status, result: entry.result }
        },

        cancel(taskId: string) {
            const entry = tasks.get(taskId)
            if (!entry) return { status: "not_found", message: `Task ${taskId} not found` }
            entry.status = "cancelled"
            return { status: "cancelled", message: `Task ${taskId} cancelled` }
        },

        async shutdown() {
            for (const [id, entry] of tasks) {
                if (entry.status === "pending" || entry.status === "running") {
                    entry.status = "cancelled"
                }
            }
            tasks.clear()
        },
    }

    // ── Skill MCP Manager ──────────────────────────────────────────────────
    const skillMcpManager: SkillMcpManager = {
        async disconnectAll() {
            // Placeholder: disconnect any running skill MCP servers
        },
    }

    return { backgroundManager, skillMcpManager }
}
