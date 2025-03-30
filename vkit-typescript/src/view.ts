import { Signal } from "./computed.js";
import { getEffect, getInjector } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { isSignal } from "./isSignal.js";
import { nodeRange } from "./nodeRange.js";
import { Template } from "./Template.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";

/**
 * Creates a dynamic view (a part of the DOM) which is rerendered when any of its inputs change.
 * The inputs can be declared by calling signals within the `getTemplate` function.
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
 * @param getTemplate A function that returns the current template.
 * @returns A template that represents a dynamic view hierarchy.
 */
export function view<T, P>(getTemplate: (value: T | null) => Template<P>): Template<P>;

export function view<T, P>(this: Signal<T>, getTemplate: (value: T | null) => Template<P>): Template<P>;

export function view<T, P>(this: Signal<T> | void, getTemplate: (value: T | null) => Template<P>): Template<P> {
	var effect = createEffect(getEffect(), getInjector(), mount);
	var range = nodeRange(true);
	var signal: Signal<T> | null | void = this;
	
	if (isSignal(signal)) {
		signal.subscribe(function(): void {
			updateEffect(effect);
		});
	} else {
		signal = null;
	}
	
	function mount(): void {
		var currentView = getTemplate(signal ? signal.get() : null);
		
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
