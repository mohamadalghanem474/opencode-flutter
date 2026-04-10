import { type OpenCodeFlutterConfig } from "./config/index";
/**
 * Load plugin configuration.
 *
 * Resolution order:
 *   1. User config: ~/.config/opencode/opencode-flutter.jsonc
 *   2. Project config: <directory>/.opencode/opencode-flutter.jsonc
 *   3. Deep merge (project overrides user)
 *   4. Validate merged result against Zod schema
 */
export declare function loadPluginConfig(directory: string): OpenCodeFlutterConfig;
export type { ConfigLoadError } from "./shared/config-errors";
//# sourceMappingURL=plugin-config.d.ts.map