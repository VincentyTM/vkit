import { createInjectable } from "./createInjectable.js";

export interface RenderConfig {
    doRunEffects: boolean;
    request: ServerRequest | undefined;
}

interface ServerRequest {
    headers: Record<string, string | string[] | undefined>;
    url: string;
}

export var RenderConfigService = createInjectable(function(): RenderConfig {
    return {
        doRunEffects: true,
        request: undefined
    };
});
