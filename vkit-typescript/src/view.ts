import { getEffect, getInjector } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { isSignal } from "./isSignal.js";
import { nodeRange } from "./nodeRange.js";
import { Signal } from "./signal.js";
import { Template } from "./Template.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";

/**
 * Creates a dynamic view (a part of the DOM) which is rerendered when any of its inputs change.
 * The inputs can be declared by calling signals within the `getCurrentView` function.
 * @example
 * function MyComponent() {
 * 	const count = signal(0);
 * 	const isCountMoreThan3 = computed(() => count() > 3);
 * 	
 * 	return view(() => {
 * 		if (isCountMoreThan3()) {
 * 			return B("Count is more than 3!");
 * 		}
 * 		
 * 		return ["Count is: ", count()];
 * 	});
 * }
 * 
 * @param getCurrentView A function that returns the current view.
 * @returns The initial view.
 */
export function view<ViewT extends Template<ContextT>, ValueT, ContextT>(
	getCurrentView: (value: ValueT | null) => ViewT
) : Template<ContextT>;

export function view<ViewT extends Template<ContextT>, ValueT, ContextT>(
	this: Signal<ValueT>,
	getCurrentView: (value: ValueT | null) => ViewT
) : Template<ContextT>;

export function view<ViewT extends Template<ContextT>, ValueT, ContextT>(
	this: Signal<ValueT> | void,
	getCurrentView: (value: ValueT | null) => ViewT
) : Template<ContextT> {
	var effect = createEffect(getEffect(), getInjector(), mount);
	var range = nodeRange(true);
	var signal: Signal<ValueT> | null | void = this;
	
	if (isSignal(signal)) {
		signal.subscribe(function(): void {
			updateEffect(effect);
		});
	} else {
		signal = null;
	}
	
	function mount() {
		var currentView = getCurrentView(signal ? signal.get() : null);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(currentView);
		}
	}
	
	enqueueUpdate(function(): void {
		updateEffect(effect);
	});
	
	return [
		range.start,
		range.end
	];
}
