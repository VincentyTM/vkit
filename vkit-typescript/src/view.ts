import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { hydrateView } from "./hydrateView.js";
import { isSignal } from "./isSignal.js";
import { serverRenderView } from "./serverRenderView.js";
import { CustomTemplate, Template } from "./Template.js";

export interface ViewTemplate<P, T> extends CustomTemplate<P> {
	readonly parentEffect: Effect;
	readonly signal: Signal<T> | null;
	errorHandler: ((error: unknown) => void) | undefined;
	getTemplate(value: T | null): Template<P>;
}

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
export function view<P extends ParentNode>(getTemplate: () => Template<P>): ViewTemplate<P, unknown>;

export function view<P extends ParentNode, T>(this: Signal<T>, getTemplate: (value: T) => Template<P>): ViewTemplate<P, T>;

export function view<P extends ParentNode, T>(this: Signal<T> | void, getTemplate: (value: T) => Template<P>): ViewTemplate<P, T> {
	return {
		parentEffect: getEffect(),
		signal: isSignal(this) ? this : null,
		errorHandler: undefined,
		getTemplate: getTemplate,
		hydrate: hydrateView,
		serverRender: serverRenderView
	};
}
