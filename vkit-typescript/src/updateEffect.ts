import { getInjector, getReactiveNode, setInjector, setReactiveNode } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { COMPUTING_FLAG } from "./reactiveNodeFlags.js";
import { throwError } from "./throwError.js";

export function updateEffect(effect: Effect): void {
	if (effect.flags & COMPUTING_FLAG) {
		throwError(new Error("Circular dependency detected"), effect.parent);
	}

	effect.flags |= COMPUTING_FLAG;
	
	var evaluatedNode = getReactiveNode(true);
	var evaluatedInjector = getInjector(true);
	
	try {
		setReactiveNode(undefined);
		destroyEffect(effect);
		setReactiveNode(effect);
		setInjector(effect.injector);
		effect.updateHandler();
	} catch (error) {
		throwError(error, effect);
	} finally {
		setReactiveNode(evaluatedNode);
		setInjector(evaluatedInjector);
		effect.flags &= ~COMPUTING_FLAG;
	}
}
