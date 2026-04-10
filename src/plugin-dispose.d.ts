import type { CreatedHooks } from "./create-hooks";
import type { Managers } from "./create-managers";
export type PluginDispose = () => Promise<void>;
interface CreatePluginDisposeDeps {
    backgroundManager: Managers["backgroundManager"];
    skillMcpManager: Managers["skillMcpManager"];
    disposeHooks: CreatedHooks["disposeHooks"];
}
export declare function createPluginDispose(deps: CreatePluginDisposeDeps): PluginDispose;
export {};
//# sourceMappingURL=plugin-dispose.d.ts.map