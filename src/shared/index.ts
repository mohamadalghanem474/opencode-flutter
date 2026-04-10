import {
    readFileSync,
    existsSync,
    mkdirSync,
} from "fs"
import { join } from "path"

// ---------------------------------------------------------------------------
// Shared utilities for opencode-flutter
// ---------------------------------------------------------------------------

export const PLUGIN_NAME = "@alghanem/opencode-flutter"
export const PLUGIN_VERSION = "0.3.3"
export const CONFIG_DIR = join(
    process.env.HOME ?? "~",
    ".config",
    "opencode",
)

/** Log helper — writes structured log via client.app.log */
export function log(
    client: any,
    level: "info" | "warn" | "error",
    message: string,
) {
    return client.app.log({
        body: { service: PLUGIN_NAME, level, message },
    })
}

/** Read a JSON file, returning an empty object on failure. */
export function readJson(path: string): Record<string, unknown> {
    try {
        return JSON.parse(readFileSync(path, "utf-8"))
    } catch {
        return {}
    }
}

/**
 * Deep merge source into target.
 * Only adds keys that don't exist in target (preserves user overrides).
 */
export function mergeDefaults(
    target: Record<string, unknown>,
    defaults: Record<string, unknown>,
): Record<string, unknown> {
    for (const key of Object.keys(defaults)) {
        if (!(key in target)) {
            target[key] = defaults[key]
        } else if (
            typeof target[key] === "object" &&
            target[key] !== null &&
            !Array.isArray(target[key]) &&
            typeof defaults[key] === "object" &&
            defaults[key] !== null &&
            !Array.isArray(defaults[key])
        ) {
            mergeDefaults(
                target[key] as Record<string, unknown>,
                defaults[key] as Record<string, unknown>,
            )
        }
    }
    return target
}

/**
 * Deep merge with set-union for array fields matching `disabled_*`.
 * Used for merging user + project plugin configs.
 */
export function mergeConfigs(
    base: Record<string, unknown>,
    override: Record<string, unknown>,
): Record<string, unknown> {
    const result = { ...base }
    for (const key of Object.keys(override)) {
        const baseVal = result[key]
        const overVal = override[key]
        if (
            key.startsWith("disabled_") &&
            Array.isArray(baseVal) &&
            Array.isArray(overVal)
        ) {
            // Set union for disabled_* arrays
            result[key] = [...new Set([...baseVal, ...overVal])]
        } else if (
            typeof baseVal === "object" &&
            baseVal !== null &&
            !Array.isArray(baseVal) &&
            typeof overVal === "object" &&
            overVal !== null &&
            !Array.isArray(overVal)
        ) {
            result[key] = mergeConfigs(
                baseVal as Record<string, unknown>,
                overVal as Record<string, unknown>,
            )
        } else {
            result[key] = overVal
        }
    }
    return result
}

// end of shared utilities
