declare const OpenCodeFlutterPlugin: (ctx: any) => Promise<{
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
    name: string;
    config: (input: import("@opencode-ai/plugin").Config) => Promise<void>;
}>;
export default OpenCodeFlutterPlugin;
export { OpenCodeFlutterPlugin as OpenCodeFlutter };
export type { OpenCodeFlutterConfig, AgentName, AgentOverrideConfig, CategoryName, CategoryConfig, HookName, BuiltinCommandName, McpName, } from "./config/index";
export type { ConfigLoadError, ConfigValidationError } from "./shared/config-errors";
//# sourceMappingURL=index.d.ts.map