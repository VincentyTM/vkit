import { Effect } from "./createEffect.js";

export function throwError(error: any, effect: Effect | null): void {
	while (effect) {
		if (effect.parent && effect.stack && error && typeof error.stack === "string" && error.stack.indexOf(effect.stack) === -1) {
			error.stack += "\n" + effect.stack;
		}

		var errorHandlers = effect.errorHandlers;
		
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
		
		effect = effect.parent;
	}

	throw error;
}
