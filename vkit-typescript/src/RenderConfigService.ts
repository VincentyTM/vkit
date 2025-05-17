import { createInjectable } from "./createInjectable.js";

export interface RenderConfig {
	cookies: Record<string, {suffix: string; value: string;}>;
	doRunEffects: boolean;
	request: ServerRequest | undefined;
	response: ServerResponse | undefined;
}

interface ServerRequest {
	headers: Record<string, string | string[] | undefined>;
	url?: string;
}

interface ServerResponse {
	setHeader(name: string, value: string): void;
	setHeader(name: string, value: string[]): void;
}

export var RenderConfigService = createInjectable(function(): RenderConfig {
	return {
		cookies: {},
		doRunEffects: true,
		request: undefined,
		response: undefined
	};
});
