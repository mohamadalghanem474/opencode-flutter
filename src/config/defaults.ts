import type { CategoryConfig } from "./index"

// ---------------------------------------------------------------------------
// Flutter-specific defaults — merged into opencode.json on first run,
// and used as category/agent fallback values at runtime.
// ---------------------------------------------------------------------------

/** Defaults merged into opencode.json (formatter, LSP, MCP, permissions, etc.) */
export const OPENCODE_DEFAULTS: Record<string, unknown> = {
    small_model: "opencode/gemini-3-flash",
    default_agent: "build",
    autoupdate: "notify",
    share: "disabled",
    instructions: ["AGENTS.md"],
    compaction: {
        auto: true,
        prune: true,
        reserved: 12000,
    },
    permission: {
        doom_loop: "ask",
        external_directory: "ask",
        websearch: "allow",
        question: "allow",
        bash: {
            "*": "allow",
            "rm -rf *": "deny",
            "git push*": "ask",
            "git reset --hard*": "deny",
            "git force*": "deny",
        },
        skill: {
            "*": "deny",
            "flutter-*": "allow",
        },
    },
    watcher: {
        ignore: [
            "**/.dart_tool/**",
            "**/build/**",
            "**/coverage/**",
            "**/ios/Pods/**",
            "**/macos/Pods/**",
            "**/android/.gradle/**",
            "**/node_modules/**",
            "**/.fvm/**",
            "**/.pub-cache/**",
            "**/.flutter-plugins/**",
        ],
    },
    formatter: {
        "dart-format": {
            command: ["dart", "format", "$FILE"],
            extensions: [".dart"],
        },
    },
    lsp: {
        dart: {
            command: ["dart", "language-server"],
            initialization: {
                closingLabels: true,
                outline: true,
                flutterOutline: true,
            },
        },
    },
    mcp: {
        context7: {
            type: "remote",
            url: "https://mcp.context7.com/mcp",
        },
        gh_grep: {
            type: "remote",
            url: "https://mcp.grep.app",
        },
    },
}

/** Companion plugins recommended on first install */
export const COMPANION_PLUGINS = [
    "opencode-dynamic-context-pruning",
    "opencode-notificator",
    "opencode-shell-strategy",
]

/** Built-in Flutter category definitions */
export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
    "flutter-ui": {
        description: "Frontend Flutter work: widgets, screens, responsive layout, theming, animation",
        model: "google/gemini-3.1-pro",
        temperature: 0.3,
        prompt_append: "You are a Flutter UI specialist. Focus on widget composition, responsive layout, theming, and visual quality. Use Material 3 patterns. Avoid unnecessary rebuilds.",
    },
    "flutter-logic": {
        description: "State management, repositories, data layer, business logic, async operations",
        model: "openai/gpt-5.4",
        temperature: 0.1,
        prompt_append: "You are a Flutter state and data specialist. Focus on clean state management, repository patterns, error handling, and testability.",
    },
    "flutter-platform": {
        description: "Native platform integration: Android, iOS, web, desktop, method channels, plugins",
        model: "anthropic/claude-opus-4-6",
        temperature: 0.1,
        prompt_append: "You are a Flutter platform integration specialist. Focus on native bridges, platform channels, plugin authoring, and platform-specific configuration.",
    },
    "flutter-quick": {
        description: "Trivial changes: single-file edits, typo fixes, simple modifications",
        model: "openai/gpt-5.4-mini",
        temperature: 0.1,
    },
    "flutter-deep": {
        description: "Complex architecture decisions, migration planning, deep debugging",
        model: "openai/gpt-5.4",
        variant: "xhigh",
        temperature: 0.0,
        prompt_append: "You are a senior Flutter architect. Think deeply about trade-offs, migration safety, and long-term maintainability before acting.",
    },
    "flutter-test": {
        description: "Testing: unit tests, widget tests, integration tests, golden tests, coverage",
        model: "openai/gpt-5.4",
        temperature: 0.1,
        prompt_append: "You are a Flutter testing specialist. Focus on comprehensive test coverage, mocking strategies, and test reliability.",
    },
}
