type ElementType = {
	[key: string]: any;
};

import type {Signal} from "./signal";

function signalProp<ValueType>(
	this: Signal<ValueType>,
	name: string
){
	var signal = this;
	
	return function(element: ElementType){
		element[name] = signal.get();
		
		signal.subscribe(function(value: ValueType){
			element[name] = value;
		});
	};
}

export default signalProp;
