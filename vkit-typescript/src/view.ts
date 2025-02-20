import type { Bindings } from "./bind.js";
import { createComponent } from "./createComponent.js";
import { nodeRange } from "./nodeRange.js";
import { enqueueUpdate } from "./update.js";
import { isSignal } from "./isSignal.js";
import type { Signal } from "./signal.js";

export type View<ContextT = unknown> = (
	| Node
	| string
	| number
	| boolean
	| null
	| undefined
	| ArrayLike<View<ContextT>>
	| Omit<Bindings<ContextT>, number>
	| Generator<View<ContextT>, View<ContextT>>
	| Signal<unknown>
	| ((element: ContextT) => void)
);

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
export function view<ViewT extends View<ContextT>, ValueT, ContextT>(
	getCurrentView: (value: ValueT | null) => ViewT
) : View<ContextT>;

export function view<ViewT extends View<ContextT>, ValueT, ContextT>(
	this: Signal<ValueT>,
	getCurrentView: (value: ValueT | null) => ViewT
) : View<ContextT>;

export function view<ViewT extends View<ContextT>, ValueT, ContextT>(
	this: Signal<ValueT> | void,
	getCurrentView: (value: ValueT | null) => ViewT
) : View<ContextT> {
	var component = createComponent(mount);
	var range = nodeRange(true);
	var render = component.render;
	var signal: Signal<ValueT> | null | void = this;
	
	if (isSignal(signal)) {
		signal.subscribe(render);
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
	
	enqueueUpdate(render);
	
	return [
		range.start,
		range.end
	];
}
