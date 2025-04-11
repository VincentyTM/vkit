import { getInjector, getReactiveNode, setInjector, setReactiveNode } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { COMPUTING_FLAG, DIRTY_FLAG } from "./reactiveNodeFlags.js";
import { throwError } from "./throwError.js";

export function updateEffect(effect: Effect): void {
	if (!(effect.flags & DIRTY_FLAG)) {
		return;
	}
	
	if (effect.flags & COMPUTING_FLAG) {
		return;
	}

	effect.flags |= COMPUTING_FLAG;
	destroyEffect(effect);
	
	var evaluatedNode = getReactiveNode(true);
	var evaluatedInjector = getInjector(true);
	
	try {
		setReactiveNode(effect);
		setInjector(effect.injector);
		effect.updateHandler();
	} catch (error) {
		throwError(error, effect);
	} finally {
		setReactiveNode(evaluatedNode);
		setInjector(evaluatedInjector);
		effect.flags &= ~(COMPUTING_FLAG | DIRTY_FLAG);
	}
}
