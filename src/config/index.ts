import { z } from "zod"

// ---------------------------------------------------------------------------
// opencode-flutter config schema — Zod-based, JSONC-compatible
// ---------------------------------------------------------------------------

// ── Agent names ──────────────────────────────────────────────────────────────

export const BUILT_IN_AGENTS = [
    "build",
    "plan",
    "general",
    "explore",
    "compaction",
    "title",
    "summary",
    "flutter-architect",
    "flutter-ui-builder",
    "flutter-state-data",
    "flutter-platform-integrator",
    "flutter-performance",
    "flutter-release-manager",
    "flutter-qa",
    "flutter-reviewer",
] as const

export type AgentName = (typeof BUILT_IN_AGENTS)[number]

// ── Hook names ───────────────────────────────────────────────────────────────

export const BUILT_IN_HOOKS = [
    // Core
    "directory-agents-injector",
    "directory-readme-injector",
    "rules-injector",
    "compaction-context-injector",
    "context-window-monitor",
    "env-file-guard",
    "write-existing-file-guard",
    "tool-output-truncator",
    // Quality
    "comment-checker",
    "edit-error-recovery",
    "thinking-block-validator",
    // Productivity
    "keyword-detector",
    "todo-continuation-enforcer",
    "auto-slash-command",
    "category-skill-reminder",
    // Recovery
    "session-recovery",
    "json-error-recovery",
    "runtime-fallback",
    "model-fallback",
] as const

export type HookName = (typeof BUILT_IN_HOOKS)[number]

// ── Category names ───────────────────────────────────────────────────────────

export const BUILT_IN_CATEGORIES = [
    "flutter-ui",
    "flutter-logic",
    "flutter-platform",
    "flutter-quick",
    "flutter-deep",
    "flutter-test",
] as const

export type CategoryName = (typeof BUILT_IN_CATEGORIES)[number]

// ── Command names ────────────────────────────────────────────────────────────

export const BUILT_IN_COMMANDS = [
    "flutter-analyze",
    "flutter-architecture",
    "flutter-codegen",
    "flutter-debug",
    "flutter-feature",
    "flutter-fix",
    "flutter-help",
    "flutter-init",
    "flutter-perf",
    "flutter-platform",
    "flutter-release",
    "flutter-review",
    "flutter-screen",
    "flutter-state",
    "flutter-test",
    "flutter-widget-test",
] as const

export type BuiltinCommandName = (typeof BUILT_IN_COMMANDS)[number]

// ── MCP names ────────────────────────────────────────────────────────────────

export type McpName = "context7" | "gh_grep" | string

// ── Sub-schemas ──────────────────────────────────────────────────────────────

const ThinkingConfigSchema = z.object({
    type: z.enum(["enabled", "disabled"]).default("disabled"),
    budgetTokens: z.number().int().positive().optional(),
})

const FallbackModelEntrySchema = z.union([
    z.string(),
    z.object({
        model: z.string(),
        variant: z.string().optional(),
        thinking: ThinkingConfigSchema.optional(),
    }),
])

const AgentOverrideSchema = z.object({
    model: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    prompt: z.string().optional(),
    prompt_append: z.string().optional(),
    fallback_models: z.array(FallbackModelEntrySchema).optional(),
    thinking: ThinkingConfigSchema.optional(),
    maxTokens: z.number().int().positive().optional(),
    reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
    steps: z.number().int().positive().optional(),
    permission: z.record(z.unknown()).optional(),
    tools: z.record(z.boolean()).optional(),
})

export type AgentOverrideConfig = z.infer<typeof AgentOverrideSchema>

const CategoryConfigSchema = z.object({
    description: z.string().optional(),
    model: z.string().optional(),
    variant: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    prompt_append: z.string().optional(),
    thinking: ThinkingConfigSchema.optional(),
    reasoningEffort: z.enum(["low", "medium", "high"]).optional(),
    textVerbosity: z.enum(["low", "medium", "high"]).optional(),
    tools: z.record(z.boolean()).optional(),
    maxTokens: z.number().int().positive().optional(),
    is_unstable_agent: z.boolean().optional(),
})

export type CategoryConfig = z.infer<typeof CategoryConfigSchema>

const TmuxConfigSchema = z.object({
    enabled: z.boolean().default(false),
    layout: z.enum(["main-vertical", "main-horizontal", "tiled", "even-horizontal", "even-vertical"]).default("main-vertical"),
})

const RalphLoopConfigSchema = z.object({
    enabled: z.boolean().default(true),
    default_max_iterations: z.number().int().positive().default(100),
})

const RuntimeFallbackConfigSchema = z.object({
    enabled: z.boolean().default(true),
    cooldown_ms: z.number().int().nonnegative().default(30000),
    max_retries: z.number().int().nonnegative().default(3),
})

const ExperimentalConfigSchema = z.object({
    task_system: z.boolean().default(false),
    safe_hook_creation: z.boolean().default(true),
    aggressive_truncation: z.boolean().default(false),
    auto_resume: z.boolean().default(false),
})

const ClaudeCodeCompatSchema = z.object({
    mcp: z.boolean().default(true),
    commands: z.boolean().default(true),
    skills: z.boolean().default(true),
    agents: z.boolean().default(true),
    hooks: z.boolean().default(true),
    plugins: z.boolean().default(true),
})

// ── Root config schema ───────────────────────────────────────────────────────

export const OpenCodeFlutterConfigSchema = z.object({
    $schema: z.string().optional(),

    // Agent overrides
    agents: z.record(z.string(), AgentOverrideSchema).default({}),

    // Category overrides & custom categories
    categories: z.record(z.string(), CategoryConfigSchema).default({}),

    // Disable lists
    disabled_hooks: z.array(z.string()).default([]),
    disabled_skills: z.array(z.string()).default([]),
    disabled_tools: z.array(z.string()).default([]),
    disabled_commands: z.array(z.string()).default([]),
    disabled_agents: z.array(z.string()).default([]),

    // Feature configs
    tmux: TmuxConfigSchema.default({}),
    ralph_loop: RalphLoopConfigSchema.default({}),
    runtime_fallback: RuntimeFallbackConfigSchema.default({}),
    experimental: ExperimentalConfigSchema.default({}),
    claude_code: ClaudeCodeCompatSchema.default({}),

    // Background task concurrency
    background: z.object({
        max_concurrent: z.number().int().positive().default(5),
    }).default({}),

    // Browser automation
    browser_automation_engine: z.object({
        provider: z.enum(["playwright", "agent-browser"]).default("playwright"),
    }).default({}),
})

export type OpenCodeFlutterConfig = z.infer<typeof OpenCodeFlutterConfigSchema>

// ── Re-exports ───────────────────────────────────────────────────────────────

export type { ConfigLoadError, ConfigValidationError } from "../shared/config-errors"
