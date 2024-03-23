import type {Component} from "./createComponent.js";

export default function throwError(error: any, component: Component | null): void {
	while (component) {
		if (component.parent && component.stack && error && typeof error.stack === "string") {
			error.stack += "\n" + component.stack;
		}
		
		if (component.emitError) {
			try {
				component.emitError(error);
				return;
			} catch (ex) {
				error = ex;
			}
		}
		component = component.parent;
	}

	throw error;
}
