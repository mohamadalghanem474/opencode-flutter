import { readFileSync, existsSync, readdirSync } from "fs"
import { join, resolve, dirname, basename } from "path"
import type { Config } from "@opencode-ai/plugin"
import { OPENCODE_DEFAULTS } from "./config/defaults"

// ---------------------------------------------------------------------------
// Config handler — injects agents, commands, and defaults via the config hook.
// No file copying. Everything is read from the plugin's own config/ directory.
// ---------------------------------------------------------------------------

const CONFIG_ROOT = resolve(
    dirname(import.meta.url.replace("file://", "")),
    "..",
    "config",
)

/**
 * Parse a markdown file with YAML frontmatter.
 * Returns { meta: Record<string, unknown>, body: string }.
 */
function parseFrontmatter(content: string): {
    meta: Record<string, unknown>
    body: string
} {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) return { meta: {}, body: content.trim() }

    const yamlBlock = match[1]
    const body = (match[2] ?? "").trim()

    // Simple YAML parser for flat + one-level nested objects
    const meta: Record<string, unknown> = {}
    let currentKey: string | null = null
    let currentObj: Record<string, string> | null = null

    for (const line of yamlBlock.split("\n")) {
        // Nested key (indented by 2+ spaces)
        const nestedMatch = line.match(/^(\s{2,})(\S+):\s*(.*)$/)
        if (nestedMatch && currentKey && currentObj) {
            const key = nestedMatch[2]
            const val = nestedMatch[3].trim().replace(/^["']|["']$/g, "")
            currentObj[key] = val
            continue
        }

        // Top-level key
        const topMatch = line.match(/^(\S+):\s*(.*)$/)
        if (topMatch) {
            // Flush previous nested object
            if (currentKey && currentObj) {
                meta[currentKey] = currentObj
            }

            const key = topMatch[1]
            const val = topMatch[2].trim().replace(/^["']|["']$/g, "")

            if (val === "" || val === undefined) {
                // Start of nested object
                currentKey = key
                currentObj = {}
            } else {
                if (currentKey && currentObj) {
                    meta[currentKey] = currentObj
                }
                currentKey = null
                currentObj = null

                // Parse booleans and numbers
                if (val === "true") meta[key] = true
                else if (val === "false") meta[key] = false
                else if (/^-?\d+(\.\d+)?$/.test(val)) meta[key] = Number(val)
                else meta[key] = val
            }
        }
    }
    if (currentKey && currentObj) {
        meta[currentKey] = currentObj
    }

    return { meta, body }
}

/**
 * Load all .md files from a directory, parse frontmatter, and return as a map.
 */
function loadMarkdownDir(dir: string): Map<string, { meta: Record<string, unknown>; body: string }> {
    const result = new Map<string, { meta: Record<string, unknown>; body: string }>()
    if (!existsSync(dir)) return result

    for (const file of readdirSync(dir)) {
        if (!file.endsWith(".md")) continue
        const name = basename(file, ".md")
        const content = readFileSync(join(dir, file), "utf-8")
        result.set(name, parseFrontmatter(content))
    }
    return result
}

/**
 * Convert permission map from YAML (string values) to OpenCode format.
 */
function convertPermission(perm: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(perm)) {
        if (typeof val === "string") {
            result[key] = val
        } else if (typeof val === "object" && val !== null) {
            result[key] = val
        }
    }
    return result
}

/**
 * Create the config hook handler that injects agents, commands, and defaults.
 * This is the ONLY integration point — everything the plugin provides flows
 * through this hook. No file copying, no manual config editing needed.
 */
export function createConfigHandler(args: {
    pluginConfig: Record<string, unknown>
}) {
    return async (input: Config) => {
        const cfg = input as any

        // ── 1. Inject ALL built-in defaults ───────────────────────────────
        // Deep-merge every key from OPENCODE_DEFAULTS into input.
        // User values always win — we only fill in what's missing.
        for (const [key, defaultVal] of Object.entries(OPENCODE_DEFAULTS)) {
            if (cfg[key] === undefined || cfg[key] === null) {
                // Field not set at all — use default as-is
                cfg[key] = defaultVal
            } else if (
                typeof cfg[key] === "object" &&
                !Array.isArray(cfg[key]) &&
                typeof defaultVal === "object" &&
                defaultVal !== null &&
                !Array.isArray(defaultVal)
            ) {
                // Both are objects — merge at one level (user keys win)
                for (const [subKey, subVal] of Object.entries(defaultVal as Record<string, unknown>)) {
                    if (cfg[key][subKey] === undefined || cfg[key][subKey] === null) {
                        cfg[key][subKey] = subVal
                    }
                }
            }
            // User already has a scalar/array value → keep it
        }

        // ── 2. Inject agents from config/agents/*.md ─────────────────────
        const agentsDir = join(CONFIG_ROOT, "agents")
        const agents = loadMarkdownDir(agentsDir)

        if (agents.size > 0) {
            if (!cfg.agent) cfg.agent = {}
            for (const [name, { meta, body }] of agents) {
                // Don't override user-defined agents
                if (cfg.agent[name]) continue

                const agentConfig: Record<string, unknown> = {}
                if (meta.description) agentConfig.description = meta.description
                if (meta.model) agentConfig.model = meta.model
                if (meta.temperature != null) agentConfig.temperature = meta.temperature
                if (meta.top_p != null) agentConfig.top_p = meta.top_p
                if (meta.mode) agentConfig.mode = meta.mode
                if (meta.color) agentConfig.color = meta.color
                if (meta.steps) agentConfig.maxSteps = meta.steps
                if (meta.permission) agentConfig.permission = convertPermission(meta.permission as Record<string, unknown>)
                if (body) agentConfig.prompt = body

                cfg.agent[name] = agentConfig
            }
        }

        // ── 3. Inject commands from config/commands/*.md ──────────────────
        const commandsDir = join(CONFIG_ROOT, "commands")
        const commands = loadMarkdownDir(commandsDir)

        if (commands.size > 0) {
            if (!cfg.command) cfg.command = {}
            for (const [name, { meta, body }] of commands) {
                // Don't override user-defined commands
                if (cfg.command[name]) continue

                const cmdConfig: Record<string, unknown> = {
                    template: body,
                }
                if (meta.description) cmdConfig.description = meta.description
                if (meta.agent) cmdConfig.agent = meta.agent
                if (meta.model) cmdConfig.model = meta.model
                if (meta.subtask != null) cmdConfig.subtask = meta.subtask

                cfg.command[name] = cmdConfig
            }
        }

        // ── 4. Inject AGENTS.md as instruction ───────────────────────────
        const agentsMdPath = join(CONFIG_ROOT, "AGENTS.md")
        if (existsSync(agentsMdPath)) {
            if (!cfg.instructions) cfg.instructions = []
            if (!cfg.instructions.includes(agentsMdPath)) {
                cfg.instructions.push(agentsMdPath)
            }
        }
    }
}
