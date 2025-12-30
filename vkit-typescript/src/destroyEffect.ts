import { Effect } from "./createEffect.js";
import { destroySubscribers } from "./destroySubscribers.js";
import { PERSISTENT_SUBSCRIBERS_FLAG } from "./reactiveNodeFlags.js";

export function destroyEffect(effect: Effect): void {
	if (!(effect.flags & PERSISTENT_SUBSCRIBERS_FLAG)) {
		destroySubscribers(effect);
		effect.subscribers = [];
	}

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
