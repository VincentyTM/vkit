import { Effect } from "./createEffect.js";

export function throwError(error: any, effect: Effect | undefined): void {
	while (effect) {
		if (effect.parent && effect.stack && error && typeof error.stack === "string" && error.stack.indexOf(effect.stack) === -1) {
			error.stack += "\n" + effect.stack;
		}

		var errorHandler = effect.errorHandler;
		
		if (errorHandler) {
			try {
				errorHandler(error);
				return;
			} catch (ex) {
				error = ex;
			}
		}
		
		effect = effect.parent;
	}

	throw error;
}
