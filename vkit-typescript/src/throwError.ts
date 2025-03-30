import { Effect } from "./createEffect.js";

export function throwError(error: any, effect: Effect | undefined): void {
	while (effect) {
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
