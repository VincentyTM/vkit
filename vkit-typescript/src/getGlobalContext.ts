import { WindowService } from "./getWindow.js";
import { inject } from "./inject.js";

var global: typeof globalThis = typeof globalThis === "object" ? globalThis : self;

export function getGlobalContext(): typeof globalThis {
	return inject(WindowService).window || global;
}
