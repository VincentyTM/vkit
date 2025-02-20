import { getComponent } from "./contextGuard.js";
import type { Signal } from "./signal.js";

type ElementType = {
	[key: string]: any;
};

export default function signalProp<T>(
	this: Signal<T>,
	name: string
): (element: ElementType) => void {
	var signal = this;
	var component = getComponent(true);
	
	return function(element: ElementType): void {
		element[name] = signal.get();
		
		signal.subscribe(function(value: T) {
			element[name] = value;
		}, signal.component === component);
	};
}
