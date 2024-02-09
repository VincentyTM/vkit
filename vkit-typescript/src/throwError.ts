import {Component} from "./component";

export default function throwError(error: any, component: Component | null): void {
	while (component) {
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
