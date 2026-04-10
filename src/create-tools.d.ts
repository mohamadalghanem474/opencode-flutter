import type { OpenCodeFlutterConfig, CategoryConfig } from "./config/index";
import type { Managers } from "./create-managers";
export interface PluginContext {
    directory: string;
    client: any;
    $: any;
}
export interface AvailableCategory {
    name: string;
    config: CategoryConfig;
}
export interface CreateToolsResult {
    filteredTools: Record<string, unknown>;
    availableCategories: AvailableCategory[];
    taskSystemEnabled: boolean;
}
interface CreateToolsDeps {
    ctx: PluginContext;
    pluginConfig: OpenCodeFlutterConfig;
    managers: Managers;
}
/** Build the complete tool registry, filtering out disabled tools */
export declare function createTools(deps: CreateToolsDeps): CreateToolsResult;
export {};
//# sourceMappingURL=create-tools.d.ts.map