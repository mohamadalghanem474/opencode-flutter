export declare const PLUGIN_NAME = "opencode-flutter";
export declare const PLUGIN_VERSION = "0.1.0";
export declare const CONFIG_DIR: string;
export declare const VERSION_FILE: string;
/** Log helper — writes structured log via client.app.log */
export declare function log(client: any, level: "info" | "warn" | "error", message: string): any;
/** Recursively copy a directory, creating targets as needed. */
export declare function copyDirSync(src: string, dest: string): void;
/** Read a JSON file, returning an empty object on failure. */
export declare function readJson(path: string): Record<string, unknown>;
/**
 * Deep merge source into target.
 * Only adds keys that don't exist in target (preserves user overrides).
 */
export declare function mergeDefaults(target: Record<string, unknown>, defaults: Record<string, unknown>): Record<string, unknown>;
/**
 * Deep merge with set-union for array fields matching `disabled_*`.
 * Used for merging user + project plugin configs.
 */
export declare function mergeConfigs(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown>;
/** Sync bundled config files to ~/.config/opencode/ */
export declare function syncConfigFiles(configRoot: string, dirs: string[], files: string[]): {
    synced: string[];
    errors: string[];
};
/** Write version marker after successful sync */
export declare function writeVersionMarker(): void;
/** Read installed version, or null if not installed */
export declare function readInstalledVersion(): string | null;
//# sourceMappingURL=index.d.ts.map