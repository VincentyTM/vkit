import type { Component } from "./createComponent.js";

export function throwError(error: any, component: Component | null): void {
	while (component) {
		if (component.parent && component.stack && error && typeof error.stack === "string" && error.stack.indexOf(component.stack) === -1) {
			error.stack += "\n" + component.stack;
		}

		var errorHandlers = component.errorHandlers;
		
		if (errorHandlers) {
			try {
				var n = errorHandlers.length;

				for (var i = 0; i < n; ++i) {
					errorHandlers[i](error);
				}

				return;
			} catch (ex) {
				error = ex;
			}
		}
		
		component = component.parent;
	}

	throw error;
}
