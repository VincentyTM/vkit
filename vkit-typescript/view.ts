import createComponent from "./component";
import createNodeRange from "./nodeRange";
import isSignal from "./isSignal";
import {Signal} from "./signal";

type View = any;

function view<ValueType>(
	this: Signal<ValueType>,
	getView: (value: ValueType | null) => View
) : View {
	var component = createComponent(mount);
	var currentView: View;
	var range = createNodeRange();
	var render = component.render;
	var signal: Signal<ValueType> | null = this;
	
	if (isSignal(signal)) {
		signal.subscribe(render);
	} else {
		signal = null;
	}
	
	function mount() {
		currentView = getView(signal ? signal.get() : null);
		
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

export {View};
export default view;
