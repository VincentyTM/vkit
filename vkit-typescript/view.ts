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

export default function view<ValueType>(
	getCurrentView: (value: ValueType | null) => View
) : View;

export default function view<ValueType>(
	this: Signal<ValueType>,
	getCurrentView: (value: ValueType | null) => View
) : View;

export default function view<ValueType>(
	this: Signal<ValueType> | void,
	getCurrentView: (value: ValueType | null) => View
) : View {
	var component = createComponent(mount);
	var currentView: View;
	var range = createNodeRange();
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
