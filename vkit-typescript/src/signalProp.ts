import { getEffect } from "./contextGuard.js";
import { Signal } from "./signal.js";

type ElementType = {
	[key: string]: any;
};

/**
 * Binds a property to the signal.
 * 
 * You should use a property binding object instead of this method.
 * 
 * @example
 * function MyComponent() {
 * 	const bgColor = signal("yellow");
 * 	const h1Color = signal("red");
 * 	const h1Title = signal("Some title");
 * 	
 * 	// It is not recommended to explicitly write signalProp:
 * 	// signalProp(document.body.style, "backgroundColor", bgColor);
 * 	bind(document.body, {
 * 		style: {
 * 			backgroundColor: bgColor
 * 		}
 * 	});
 * 	
 * 	// Binding multiple properties of the same element:
 * 	// (el) => {
 * 	// 	signalProp(el.style, "color", h1Color);
 * 	// 	signalProp(el, "title", h1Title);
 * 	// }
 * 	return H1("Hello world", {
 * 		style: {
 * 			color: h1Color
 * 		},
 * 		title: h1Title
 * 	});
 * }
 * 
 * @param element The element that owns the property.
 * @param name The name of the property.
 * @param valueSignal The signal that contains the current value for the property.
 */
export function signalProp<T>(
	element: ElementType,
	name: string,
	valueSignal: Signal<T>
): void {
	var effect = getEffect(true);
	
	element[name] = valueSignal.get();
	
	valueSignal.subscribe(function(value: T) {
		element[name] = value;
	}, valueSignal.parentEffect === effect);
}
