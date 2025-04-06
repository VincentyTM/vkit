import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { COMPUTING_FLAG } from "./reactiveNodeFlags.js";
import { throwError } from "./throwError.js";

export function updateEffect(effect: Effect): void {
	if (effect.flags & COMPUTING_FLAG) {
		throwError(new Error("Circular dependency detected"), effect.parent);
	}

	effect.flags |= COMPUTING_FLAG;
	
	var previousEffect = getEffect(true);
	var previousInjector = getInjector(true);
	
	try {
		setEffect(undefined);
		destroyEffect(effect);
		setEffect(effect);
		setInjector(effect.injector);
		effect.updateHandler();
	} catch (error) {
		throwError(error, effect);
	} finally {
		setEffect(previousEffect);
		setInjector(previousInjector);
		effect.flags &= ~COMPUTING_FLAG;
	}
}
