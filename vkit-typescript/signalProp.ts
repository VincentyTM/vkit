import {Signal} from "./signal";

type ElementType = {
	[key: string]: any;
};

export default function signalProp<ValueType>(
	this: Signal<ValueType>,
	name: string
): (element: ElementType) => void {
	var signal = this;
	
	return function(element: ElementType) {
		element[name] = signal.get();
		signal.subscribe(function(value: ValueType) {
			element[name] = value;
		});
	};
}
