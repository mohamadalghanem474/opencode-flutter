import type { OpenCodeFlutterConfig } from "./config/index";
import type { CreatedHooks } from "./create-hooks";
import type { CreateToolsResult, PluginContext } from "./create-tools";
import type { Managers } from "./create-managers";
interface CreatePluginInterfaceDeps {
    ctx: PluginContext;
    pluginConfig: OpenCodeFlutterConfig;
    managers: Managers;
    hooks: CreatedHooks;
    tools: CreateToolsResult;
}
export interface PluginInterface {
    tool: Record<string, unknown>;
    "tool.execute.before": (input: any, output: any) => Promise<void>;
    "tool.execute.after": (input: any, output: any) => Promise<void>;
    "experimental.session.compacting": (input: {
        sessionID: string;
    }, output: {
        context: string[];
    }) => Promise<void>;
    event?: (input: {
        event: any;
    }) => Promise<void>;
}
export declare function createPluginInterface(deps: CreatePluginInterfaceDeps): PluginInterface;
export {};
//# sourceMappingURL=plugin-interface.d.ts.map