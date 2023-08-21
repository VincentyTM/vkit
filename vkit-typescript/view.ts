import createComponent from "./component";
import createNodeRange from "./nodeRange";

import type {Signal} from "./signal";

type View = any;

function view<ValueType>(
	this: Signal<ValueType>,
	getView: (value: ValueType | null) => View
) : View {
	var component = createComponent(mount);
	var currentView;
	var range = createNodeRange();
	var render = component.render;
	var signal: Signal<ValueType> | null = this;
	
	if(!(signal && typeof signal.get === "function" && typeof signal.subscribe === "function")){
		signal = null;
	}
	
	function mount(){
		currentView = getView(signal ? signal.get() : null);
		
		if( range.start.nextSibling ){
			range.clear();
			range.append(currentView);
		}
	}
	
	render();
	
	if( signal ){
		signal.subscribe(render);
	}
	
	return [
		range.start,
		currentView,
		range.end
	];
}

export type {View};

export default view;
