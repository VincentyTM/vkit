import effect from "./effect.js";

export default function prop<ElementType, ValueType>(
	name: string,
	getValue: () => ValueType
) {
	return function(element: ElementType) {
		effect(function() {
			(element as any)[name] = getValue();
		});
	};
}
