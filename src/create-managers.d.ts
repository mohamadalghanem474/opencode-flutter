import type { OpenCodeFlutterConfig } from "./config/index";
export interface BackgroundTask {
    agent: string;
    prompt: string;
}
export interface BackgroundManager {
    enqueue(task: BackgroundTask): string;
    getResult(taskId: string): {
        status: string;
        result?: unknown;
        error?: string;
    };
    cancel(taskId: string): {
        status: string;
        message: string;
    };
    shutdown(): Promise<void>;
}
export interface SkillMcpManager {
    disconnectAll(): Promise<void>;
}
export interface Managers {
    backgroundManager: BackgroundManager | null;
    skillMcpManager: SkillMcpManager;
}
interface CreateManagersDeps {
    pluginConfig: OpenCodeFlutterConfig;
}
export declare function createManagers(deps: CreateManagersDeps): Managers;
export {};
//# sourceMappingURL=create-managers.d.ts.map