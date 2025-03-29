import { createInjectable } from "./createInjectable.js";

export interface RenderConfig {
    headers: Record<string, string | string[] | undefined> | undefined;
}

export var RenderConfigService = createInjectable(function(): RenderConfig {
    return {
        headers: undefined
    };
});
