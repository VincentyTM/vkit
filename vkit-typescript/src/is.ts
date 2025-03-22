import { effect } from "./effect.js";
import { getEffect } from "./contextGuard.js";

/**
 * Evaluates a function returning a boolean and rerenders the current view/views/effect block when that boolean value changes.
 * 
 * See the following example. If `is` was not used there, the view block would be rerendered every time `count` changes.
 * @example
 * function Counter() {
 * 	const count = signal(5);
 * 	
 * 	return view(() => {
 * 		if (is(() => count() > 3)) {
 * 			return "Count is more than 3!";
 * 		} else {
 * 			return "Count is less than or equal to 3!";
 * 		}
 * 	});
 * }
 * 
 * @param condition The function that returns a boolean. It can have reactive inputs in it.
 * @returns The return value of the `condition` function.
 */
export function is(condition: () => boolean): boolean {
	var parent = getEffect();
	var value: boolean | undefined;
	
	effect(function() {
		var oldValue = value;
		value = condition();
		
		if (oldValue !== value && oldValue !== undefined) {
			parent.render();
		}
	});
	
	return value as boolean;
}
