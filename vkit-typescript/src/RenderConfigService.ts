import { createInjectable } from "./createInjectable.js";

export interface RenderConfig {
    doRunEffects: boolean;
    headers: Record<string, string | string[] | undefined> | undefined;
}

export var RenderConfigService = createInjectable(function(): RenderConfig {
    return {
        doRunEffects: true,
        headers: undefined
    };
});
