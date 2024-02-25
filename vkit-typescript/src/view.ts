import {Bindings} from "./bind";
import createComponent from "./component";
import createNodeRange from "./nodeRange";
import isSignal from "./isSignal";
import {Signal} from "./signal";

export type View<ContextType = unknown> = (
	Node |
	string |
	number |
	boolean |
	null |
	undefined |
	ArrayLike<View<ContextType>> |
	Bindings<ContextType> |
	Generator<View<ContextType>, View<ContextType>> |
	Signal<unknown> |
	((element: ContextType) => void)
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
export default function view<ValueType, ContextType>(
	getCurrentView: (value: ValueType | null) => View<ContextType>
) : View<ContextType>;

export default function view<ValueType, ContextType>(
	this: Signal<ValueType>,
	getCurrentView: (value: ValueType | null) => View<ContextType>
) : View<ContextType>;

export default function view<ValueType, ContextType>(
	this: Signal<ValueType> | void,
	getCurrentView: (value: ValueType | null) => View<ContextType>
) : View<ContextType> {
	var component = createComponent(mount);
	var currentView: View;
	var range = createNodeRange(true);
	var render = component.render;
	var signal: Signal<ValueType> | null | void = this;
	
	if (isSignal(signal)) {
		(signal as Signal<ValueType>).subscribe(render);
	} else {
		signal = null;
	}
	
	function mount() {
		currentView = getCurrentView(signal ? signal.get() : null);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(currentView);
		}
	}
	
	render();
	
	return [
		range.start,
		currentView,
		range.end
	];
}
