import { Effect } from "./createEffect.js";

export function destroyEffect(effect: Effect): void {
	var children = effect.children;

	if (children) {
		effect.children = undefined;
		
		var n = children.length;
		
		for (var i = 0; i < n; ++i) {
			destroyEffect(children[i]);
		}
	}
	
	var parent = effect.parent;

	if (parent) {
		var siblings = parent.children;
		
		if (siblings) {
			for (var i = siblings.length; i--;) {
				if (siblings[i] === effect) {
					siblings.splice(i, 1);
					break;
				}
			}
		}
	}
	
	var destroyHandlers = effect.destroyHandlers;
	
	if (destroyHandlers !== undefined) {
		effect.destroyHandlers = undefined;

		var n = destroyHandlers.length;

		for(var i = 0; i < n; ++i) {
			destroyHandlers[i]();
		}
	}
}
