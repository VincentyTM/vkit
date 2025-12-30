import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { hydrateView } from "./hydrateView.js";
import { serverRenderView } from "./serverRenderView.js";
import { CustomTemplate, Template } from "./Template.js";

export interface ViewTemplate<P> extends CustomTemplate<P> {
	readonly parentEffect: Effect;
	errorHandler: ((error: unknown) => void) | undefined;
	getTemplate(): Template<P>;
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
export function view<P extends ParentNode>(getTemplate: () => Template<P>): ViewTemplate<P> {
	return {
		parentEffect: getEffect(),
		errorHandler: undefined,
		getTemplate: getTemplate,
		hydrate: hydrateView,
		serverRender: serverRenderView
	};
}
