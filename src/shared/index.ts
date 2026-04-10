import {
    readFileSync,
    writeFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    statSync,
    copyFileSync,
} from "fs"
import { join } from "path"

// ---------------------------------------------------------------------------
// Shared utilities for opencode-flutter
// ---------------------------------------------------------------------------

export const PLUGIN_NAME = "@alghanem/opencode-flutter"
export const PLUGIN_VERSION = "0.1.0"
export const CONFIG_DIR = join(
    process.env.HOME ?? "~",
    ".config",
    "opencode",
)
export const VERSION_FILE = join(CONFIG_DIR, ".opencode-flutter-version")

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

/** Recursively copy a directory, creating targets as needed. */
export function copyDirSync(src: string, dest: string) {
    mkdirSync(dest, { recursive: true })
    for (const entry of readdirSync(src)) {
        const srcPath = join(src, entry)
        const destPath = join(dest, entry)
        if (statSync(srcPath).isDirectory()) {
            copyDirSync(srcPath, destPath)
        } else {
            copyFileSync(srcPath, destPath)
        }
    }
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

/** Sync bundled config files to ~/.config/opencode/ */
export function syncConfigFiles(
    configRoot: string,
    dirs: string[],
    files: string[],
): { synced: string[]; errors: string[] } {
    const synced: string[] = []
    const errors: string[] = []

    for (const dir of dirs) {
        const src = join(configRoot, dir)
        const dest = join(CONFIG_DIR, dir)
        if (existsSync(src)) {
            try {
                copyDirSync(src, dest)
                synced.push(dir)
            } catch (err) {
                errors.push(`${dir}: ${err}`)
            }
        }
    }

    for (const file of files) {
        const src = join(configRoot, file)
        const dest = join(CONFIG_DIR, file)
        if (existsSync(src)) {
            try {
                mkdirSync(join(CONFIG_DIR), { recursive: true })
                copyFileSync(src, dest)
                synced.push(file)
            } catch (err) {
                errors.push(`${file}: ${err}`)
            }
        }
    }

    return { synced, errors }
}

/** Write version marker after successful sync */
export function writeVersionMarker() {
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(VERSION_FILE, PLUGIN_VERSION, "utf-8")
}

/** Read installed version, or null if not installed */
export function readInstalledVersion(): string | null {
    if (!existsSync(VERSION_FILE)) return null
    return readFileSync(VERSION_FILE, "utf-8").trim()
}
