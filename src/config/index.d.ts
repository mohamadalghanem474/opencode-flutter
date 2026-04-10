import { z } from "zod";
export declare const BUILT_IN_AGENTS: readonly ["build", "plan", "general", "explore", "compaction", "title", "summary", "flutter-architect", "flutter-ui-builder", "flutter-state-data", "flutter-platform-integrator", "flutter-performance", "flutter-release-manager", "flutter-qa", "flutter-reviewer"];
export type AgentName = (typeof BUILT_IN_AGENTS)[number];
export declare const BUILT_IN_HOOKS: readonly ["directory-agents-injector", "directory-readme-injector", "rules-injector", "compaction-context-injector", "context-window-monitor", "env-file-guard", "write-existing-file-guard", "tool-output-truncator", "comment-checker", "edit-error-recovery", "thinking-block-validator", "keyword-detector", "todo-continuation-enforcer", "auto-slash-command", "category-skill-reminder", "session-recovery", "json-error-recovery", "runtime-fallback", "model-fallback"];
export type HookName = (typeof BUILT_IN_HOOKS)[number];
export declare const BUILT_IN_CATEGORIES: readonly ["flutter-ui", "flutter-logic", "flutter-platform", "flutter-quick", "flutter-deep", "flutter-test"];
export type CategoryName = (typeof BUILT_IN_CATEGORIES)[number];
export declare const BUILT_IN_COMMANDS: readonly ["flutter-analyze", "flutter-architecture", "flutter-codegen", "flutter-debug", "flutter-feature", "flutter-fix", "flutter-help", "flutter-init", "flutter-perf", "flutter-platform", "flutter-release", "flutter-review", "flutter-screen", "flutter-state", "flutter-test", "flutter-widget-test"];
export type BuiltinCommandName = (typeof BUILT_IN_COMMANDS)[number];
export type McpName = "context7" | "gh_grep" | string;
declare const AgentOverrideSchema: z.ZodObject<{
    model: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    prompt: z.ZodOptional<z.ZodString>;
    prompt_append: z.ZodOptional<z.ZodString>;
    fallback_models: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
        model: z.ZodString;
        variant: z.ZodOptional<z.ZodString>;
        thinking: z.ZodOptional<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["enabled", "disabled"]>>;
            budgetTokens: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        }, {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        variant?: string | undefined;
        thinking?: {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        } | undefined;
    }, {
        model: string;
        variant?: string | undefined;
        thinking?: {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        } | undefined;
    }>]>, "many">>;
    thinking: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["enabled", "disabled"]>>;
        budgetTokens: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "enabled" | "disabled";
        budgetTokens?: number | undefined;
    }, {
        type?: "enabled" | "disabled" | undefined;
        budgetTokens?: number | undefined;
    }>>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    steps: z.ZodOptional<z.ZodNumber>;
    permission: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tools: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    model?: string | undefined;
    thinking?: {
        type: "enabled" | "disabled";
        budgetTokens?: number | undefined;
    } | undefined;
    temperature?: number | undefined;
    prompt?: string | undefined;
    prompt_append?: string | undefined;
    fallback_models?: (string | {
        model: string;
        variant?: string | undefined;
        thinking?: {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        } | undefined;
    })[] | undefined;
    maxTokens?: number | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
    steps?: number | undefined;
    permission?: Record<string, unknown> | undefined;
    tools?: Record<string, boolean> | undefined;
}, {
    model?: string | undefined;
    thinking?: {
        type?: "enabled" | "disabled" | undefined;
        budgetTokens?: number | undefined;
    } | undefined;
    temperature?: number | undefined;
    prompt?: string | undefined;
    prompt_append?: string | undefined;
    fallback_models?: (string | {
        model: string;
        variant?: string | undefined;
        thinking?: {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        } | undefined;
    })[] | undefined;
    maxTokens?: number | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
    steps?: number | undefined;
    permission?: Record<string, unknown> | undefined;
    tools?: Record<string, boolean> | undefined;
}>;
export type AgentOverrideConfig = z.infer<typeof AgentOverrideSchema>;
declare const CategoryConfigSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    model: z.ZodOptional<z.ZodString>;
    variant: z.ZodOptional<z.ZodString>;
    temperature: z.ZodOptional<z.ZodNumber>;
    top_p: z.ZodOptional<z.ZodNumber>;
    prompt_append: z.ZodOptional<z.ZodString>;
    thinking: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["enabled", "disabled"]>>;
        budgetTokens: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "enabled" | "disabled";
        budgetTokens?: number | undefined;
    }, {
        type?: "enabled" | "disabled" | undefined;
        budgetTokens?: number | undefined;
    }>>;
    reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    textVerbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    tools: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    is_unstable_agent: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    model?: string | undefined;
    variant?: string | undefined;
    thinking?: {
        type: "enabled" | "disabled";
        budgetTokens?: number | undefined;
    } | undefined;
    temperature?: number | undefined;
    prompt_append?: string | undefined;
    maxTokens?: number | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
    tools?: Record<string, boolean> | undefined;
    description?: string | undefined;
    top_p?: number | undefined;
    textVerbosity?: "low" | "medium" | "high" | undefined;
    is_unstable_agent?: boolean | undefined;
}, {
    model?: string | undefined;
    variant?: string | undefined;
    thinking?: {
        type?: "enabled" | "disabled" | undefined;
        budgetTokens?: number | undefined;
    } | undefined;
    temperature?: number | undefined;
    prompt_append?: string | undefined;
    maxTokens?: number | undefined;
    reasoningEffort?: "low" | "medium" | "high" | undefined;
    tools?: Record<string, boolean> | undefined;
    description?: string | undefined;
    top_p?: number | undefined;
    textVerbosity?: "low" | "medium" | "high" | undefined;
    is_unstable_agent?: boolean | undefined;
}>;
export type CategoryConfig = z.infer<typeof CategoryConfigSchema>;
export declare const OpenCodeFlutterConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    agents: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        model: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        prompt: z.ZodOptional<z.ZodString>;
        prompt_append: z.ZodOptional<z.ZodString>;
        fallback_models: z.ZodOptional<z.ZodArray<z.ZodUnion<[z.ZodString, z.ZodObject<{
            model: z.ZodString;
            variant: z.ZodOptional<z.ZodString>;
            thinking: z.ZodOptional<z.ZodObject<{
                type: z.ZodDefault<z.ZodEnum<["enabled", "disabled"]>>;
                budgetTokens: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                type: "enabled" | "disabled";
                budgetTokens?: number | undefined;
            }, {
                type?: "enabled" | "disabled" | undefined;
                budgetTokens?: number | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            model: string;
            variant?: string | undefined;
            thinking?: {
                type: "enabled" | "disabled";
                budgetTokens?: number | undefined;
            } | undefined;
        }, {
            model: string;
            variant?: string | undefined;
            thinking?: {
                type?: "enabled" | "disabled" | undefined;
                budgetTokens?: number | undefined;
            } | undefined;
        }>]>, "many">>;
        thinking: z.ZodOptional<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["enabled", "disabled"]>>;
            budgetTokens: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        }, {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        }>>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        steps: z.ZodOptional<z.ZodNumber>;
        permission: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        tools: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        thinking?: {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt?: string | undefined;
        prompt_append?: string | undefined;
        fallback_models?: (string | {
            model: string;
            variant?: string | undefined;
            thinking?: {
                type: "enabled" | "disabled";
                budgetTokens?: number | undefined;
            } | undefined;
        })[] | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        steps?: number | undefined;
        permission?: Record<string, unknown> | undefined;
        tools?: Record<string, boolean> | undefined;
    }, {
        model?: string | undefined;
        thinking?: {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt?: string | undefined;
        prompt_append?: string | undefined;
        fallback_models?: (string | {
            model: string;
            variant?: string | undefined;
            thinking?: {
                type?: "enabled" | "disabled" | undefined;
                budgetTokens?: number | undefined;
            } | undefined;
        })[] | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        steps?: number | undefined;
        permission?: Record<string, unknown> | undefined;
        tools?: Record<string, boolean> | undefined;
    }>>>;
    categories: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        description: z.ZodOptional<z.ZodString>;
        model: z.ZodOptional<z.ZodString>;
        variant: z.ZodOptional<z.ZodString>;
        temperature: z.ZodOptional<z.ZodNumber>;
        top_p: z.ZodOptional<z.ZodNumber>;
        prompt_append: z.ZodOptional<z.ZodString>;
        thinking: z.ZodOptional<z.ZodObject<{
            type: z.ZodDefault<z.ZodEnum<["enabled", "disabled"]>>;
            budgetTokens: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        }, {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        }>>;
        reasoningEffort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        textVerbosity: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        tools: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
        maxTokens: z.ZodOptional<z.ZodNumber>;
        is_unstable_agent: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        model?: string | undefined;
        variant?: string | undefined;
        thinking?: {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt_append?: string | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        tools?: Record<string, boolean> | undefined;
        description?: string | undefined;
        top_p?: number | undefined;
        textVerbosity?: "low" | "medium" | "high" | undefined;
        is_unstable_agent?: boolean | undefined;
    }, {
        model?: string | undefined;
        variant?: string | undefined;
        thinking?: {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt_append?: string | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        tools?: Record<string, boolean> | undefined;
        description?: string | undefined;
        top_p?: number | undefined;
        textVerbosity?: "low" | "medium" | "high" | undefined;
        is_unstable_agent?: boolean | undefined;
    }>>>;
    disabled_hooks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    disabled_skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    disabled_tools: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    disabled_commands: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    disabled_agents: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    tmux: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        layout: z.ZodDefault<z.ZodEnum<["main-vertical", "main-horizontal", "tiled", "even-horizontal", "even-vertical"]>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        layout: "main-vertical" | "main-horizontal" | "tiled" | "even-horizontal" | "even-vertical";
    }, {
        enabled?: boolean | undefined;
        layout?: "main-vertical" | "main-horizontal" | "tiled" | "even-horizontal" | "even-vertical" | undefined;
    }>>;
    ralph_loop: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        default_max_iterations: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        default_max_iterations: number;
    }, {
        enabled?: boolean | undefined;
        default_max_iterations?: number | undefined;
    }>>;
    runtime_fallback: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        cooldown_ms: z.ZodDefault<z.ZodNumber>;
        max_retries: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        cooldown_ms: number;
        max_retries: number;
    }, {
        enabled?: boolean | undefined;
        cooldown_ms?: number | undefined;
        max_retries?: number | undefined;
    }>>;
    experimental: z.ZodDefault<z.ZodObject<{
        task_system: z.ZodDefault<z.ZodBoolean>;
        safe_hook_creation: z.ZodDefault<z.ZodBoolean>;
        aggressive_truncation: z.ZodDefault<z.ZodBoolean>;
        auto_resume: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        task_system: boolean;
        safe_hook_creation: boolean;
        aggressive_truncation: boolean;
        auto_resume: boolean;
    }, {
        task_system?: boolean | undefined;
        safe_hook_creation?: boolean | undefined;
        aggressive_truncation?: boolean | undefined;
        auto_resume?: boolean | undefined;
    }>>;
    claude_code: z.ZodDefault<z.ZodObject<{
        mcp: z.ZodDefault<z.ZodBoolean>;
        commands: z.ZodDefault<z.ZodBoolean>;
        skills: z.ZodDefault<z.ZodBoolean>;
        agents: z.ZodDefault<z.ZodBoolean>;
        hooks: z.ZodDefault<z.ZodBoolean>;
        plugins: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        mcp: boolean;
        commands: boolean;
        skills: boolean;
        agents: boolean;
        hooks: boolean;
        plugins: boolean;
    }, {
        mcp?: boolean | undefined;
        commands?: boolean | undefined;
        skills?: boolean | undefined;
        agents?: boolean | undefined;
        hooks?: boolean | undefined;
        plugins?: boolean | undefined;
    }>>;
    background: z.ZodDefault<z.ZodObject<{
        max_concurrent: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        max_concurrent: number;
    }, {
        max_concurrent?: number | undefined;
    }>>;
    browser_automation_engine: z.ZodDefault<z.ZodObject<{
        provider: z.ZodDefault<z.ZodEnum<["playwright", "agent-browser"]>>;
    }, "strip", z.ZodTypeAny, {
        provider: "playwright" | "agent-browser";
    }, {
        provider?: "playwright" | "agent-browser" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    agents: Record<string, {
        model?: string | undefined;
        thinking?: {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt?: string | undefined;
        prompt_append?: string | undefined;
        fallback_models?: (string | {
            model: string;
            variant?: string | undefined;
            thinking?: {
                type: "enabled" | "disabled";
                budgetTokens?: number | undefined;
            } | undefined;
        })[] | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        steps?: number | undefined;
        permission?: Record<string, unknown> | undefined;
        tools?: Record<string, boolean> | undefined;
    }>;
    categories: Record<string, {
        model?: string | undefined;
        variant?: string | undefined;
        thinking?: {
            type: "enabled" | "disabled";
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt_append?: string | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        tools?: Record<string, boolean> | undefined;
        description?: string | undefined;
        top_p?: number | undefined;
        textVerbosity?: "low" | "medium" | "high" | undefined;
        is_unstable_agent?: boolean | undefined;
    }>;
    disabled_hooks: string[];
    disabled_skills: string[];
    disabled_tools: string[];
    disabled_commands: string[];
    disabled_agents: string[];
    tmux: {
        enabled: boolean;
        layout: "main-vertical" | "main-horizontal" | "tiled" | "even-horizontal" | "even-vertical";
    };
    ralph_loop: {
        enabled: boolean;
        default_max_iterations: number;
    };
    runtime_fallback: {
        enabled: boolean;
        cooldown_ms: number;
        max_retries: number;
    };
    experimental: {
        task_system: boolean;
        safe_hook_creation: boolean;
        aggressive_truncation: boolean;
        auto_resume: boolean;
    };
    claude_code: {
        mcp: boolean;
        commands: boolean;
        skills: boolean;
        agents: boolean;
        hooks: boolean;
        plugins: boolean;
    };
    background: {
        max_concurrent: number;
    };
    browser_automation_engine: {
        provider: "playwright" | "agent-browser";
    };
    $schema?: string | undefined;
}, {
    agents?: Record<string, {
        model?: string | undefined;
        thinking?: {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt?: string | undefined;
        prompt_append?: string | undefined;
        fallback_models?: (string | {
            model: string;
            variant?: string | undefined;
            thinking?: {
                type?: "enabled" | "disabled" | undefined;
                budgetTokens?: number | undefined;
            } | undefined;
        })[] | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        steps?: number | undefined;
        permission?: Record<string, unknown> | undefined;
        tools?: Record<string, boolean> | undefined;
    }> | undefined;
    $schema?: string | undefined;
    categories?: Record<string, {
        model?: string | undefined;
        variant?: string | undefined;
        thinking?: {
            type?: "enabled" | "disabled" | undefined;
            budgetTokens?: number | undefined;
        } | undefined;
        temperature?: number | undefined;
        prompt_append?: string | undefined;
        maxTokens?: number | undefined;
        reasoningEffort?: "low" | "medium" | "high" | undefined;
        tools?: Record<string, boolean> | undefined;
        description?: string | undefined;
        top_p?: number | undefined;
        textVerbosity?: "low" | "medium" | "high" | undefined;
        is_unstable_agent?: boolean | undefined;
    }> | undefined;
    disabled_hooks?: string[] | undefined;
    disabled_skills?: string[] | undefined;
    disabled_tools?: string[] | undefined;
    disabled_commands?: string[] | undefined;
    disabled_agents?: string[] | undefined;
    tmux?: {
        enabled?: boolean | undefined;
        layout?: "main-vertical" | "main-horizontal" | "tiled" | "even-horizontal" | "even-vertical" | undefined;
    } | undefined;
    ralph_loop?: {
        enabled?: boolean | undefined;
        default_max_iterations?: number | undefined;
    } | undefined;
    runtime_fallback?: {
        enabled?: boolean | undefined;
        cooldown_ms?: number | undefined;
        max_retries?: number | undefined;
    } | undefined;
    experimental?: {
        task_system?: boolean | undefined;
        safe_hook_creation?: boolean | undefined;
        aggressive_truncation?: boolean | undefined;
        auto_resume?: boolean | undefined;
    } | undefined;
    claude_code?: {
        mcp?: boolean | undefined;
        commands?: boolean | undefined;
        skills?: boolean | undefined;
        agents?: boolean | undefined;
        hooks?: boolean | undefined;
        plugins?: boolean | undefined;
    } | undefined;
    background?: {
        max_concurrent?: number | undefined;
    } | undefined;
    browser_automation_engine?: {
        provider?: "playwright" | "agent-browser" | undefined;
    } | undefined;
}>;
export type OpenCodeFlutterConfig = z.infer<typeof OpenCodeFlutterConfigSchema>;
export type { ConfigLoadError, ConfigValidationError } from "../shared/config-errors";
//# sourceMappingURL=index.d.ts.map