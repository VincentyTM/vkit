import type {Signal} from "./signal.js";

type ElementType = {
	[key: string]: any;
};

export default function signalProp<T>(
	this: Signal<T>,
	name: string
): (element: ElementType) => void {
	var signal = this;
	
	return function(element: ElementType) {
		element[name] = signal.get();
		signal.subscribe(function(value: T) {
			element[name] = value;
		});
	};
}
