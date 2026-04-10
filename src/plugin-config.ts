import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { parse as parseJsonc } from "jsonc-parser"
import {
    OpenCodeFlutterConfigSchema,
    type OpenCodeFlutterConfig,
} from "./config/index"
import { ConfigLoadError, ConfigValidationError } from "./shared/config-errors"
import { CONFIG_DIR, mergeConfigs } from "./shared/index"

// ---------------------------------------------------------------------------
// Plugin config loader — JSONC parsing, user + project merge, Zod validation
// ---------------------------------------------------------------------------

const CONFIG_BASENAMES = [
    "opencode-flutter.jsonc",
    "opencode-flutter.json",
]

/** Find the first existing config file in a directory */
function findConfigFile(dir: string): string | null {
    for (const name of CONFIG_BASENAMES) {
        const path = join(dir, name)
        if (existsSync(path)) return path
    }
    return null
}

/** Parse a JSONC file (comments + trailing commas allowed) */
function parseConfigFile(path: string): Record<string, unknown> {
    const content = readFileSync(path, "utf-8")
    const errors: Array<{ error: number; offset: number; length: number }> = []
    const result = parseJsonc(content, errors)
    if (errors.length > 0) {
        throw new ConfigLoadError(
            `JSONC parse error at offset ${errors[0].offset}`,
            path,
        )
    }
    return result ?? {}
}

/**
 * Attempt to validate raw config against Zod schema.
 * On full validation failure, fall back to partial parse
 * (only extract arrays and simple fields that parsed).
 */
function validateConfig(
    raw: Record<string, unknown>,
    sourcePath: string,
): OpenCodeFlutterConfig {
    const result = OpenCodeFlutterConfigSchema.safeParse(raw)
    if (result.success) return result.data

    // Graceful partial parse: extract what we can
    const partial: Record<string, unknown> = {}
    for (const key of Object.keys(raw)) {
        if (key.startsWith("disabled_") && Array.isArray(raw[key])) {
            partial[key] = raw[key]
        }
    }

    const issues = result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
    }))

    console.warn(
        `[opencode-flutter] Config validation warnings in ${sourcePath}:`,
        issues.map((i) => `  ${i.path}: ${i.message}`).join("\n"),
    )

    // Re-parse with partial data + schema defaults
    const fallback = OpenCodeFlutterConfigSchema.safeParse(partial)
    if (fallback.success) return fallback.data

    // Absolute fallback: empty config with all defaults
    return OpenCodeFlutterConfigSchema.parse({})
}

/**
 * Load plugin configuration.
 *
 * Resolution order:
 *   1. User config: ~/.config/opencode/opencode-flutter.jsonc
 *   2. Project config: <directory>/.opencode/opencode-flutter.jsonc
 *   3. Deep merge (project overrides user)
 *   4. Validate merged result against Zod schema
 */
export function loadPluginConfig(
    directory: string,
): OpenCodeFlutterConfig {
    let userRaw: Record<string, unknown> = {}
    let projectRaw: Record<string, unknown> = {}

    // 1. User-level config
    const userPath = findConfigFile(CONFIG_DIR)
    if (userPath) {
        try {
            userRaw = parseConfigFile(userPath)
        } catch (err) {
            console.warn(`[opencode-flutter] User config load error: ${err}`)
        }
    }

    // 2. Project-level config
    const projectDir = join(directory, ".opencode")
    const projectPath = findConfigFile(projectDir)
    if (projectPath) {
        try {
            projectRaw = parseConfigFile(projectPath)
        } catch (err) {
            console.warn(`[opencode-flutter] Project config load error: ${err}`)
        }
    }

    // 3. Merge (project overrides user, set-union for disabled_*)
    const merged =
        Object.keys(userRaw).length > 0 || Object.keys(projectRaw).length > 0
            ? mergeConfigs(userRaw, projectRaw)
            : {}

    // 4. Validate
    const sourcePath = projectPath ?? userPath ?? "(defaults)"
    return validateConfig(merged as Record<string, unknown>, sourcePath)
}

export type { ConfigLoadError } from "./shared/config-errors"
