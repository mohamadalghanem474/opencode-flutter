import type { OpenCodeFlutterConfig } from "./config/index";
export interface HookContext {
    directory: string;
    client: any;
}
export interface DisposableHook {
    dispose(): void;
}
export interface CreatedHooks {
    envFileGuard: boolean;
    compactionContextInjector: {
        inject(sessionId: string): string;
        capture?(sessionId: string): Promise<void>;
    } | null;
    directoryAgentsInjector: boolean;
    writeExistingFileGuard: boolean;
    toolOutputTruncator: boolean;
    commentChecker: (DisposableHook & {
        check(output: string): string | null;
    }) | null;
    keywordDetector: boolean;
    todoContinuationEnforcer: (DisposableHook & {
        enforce(): void;
    }) | null;
    runtimeFallback: DisposableHook | null;
    disposeHooks(): void;
}
interface CreateHooksDeps {
    ctx: HookContext;
    pluginConfig: OpenCodeFlutterConfig;
}
export declare function createHooks(deps: CreateHooksDeps): CreatedHooks;
/**
 * Walk from `filePath` up to `projectRoot`, collecting AGENTS.md content
 * at each level (closest to file = highest priority).
 */
export declare function collectAgentsMd(filePath: string, projectRoot: string): string[];
export {};
//# sourceMappingURL=create-hooks.d.ts.map