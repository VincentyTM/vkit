import effect from "./effect.js";

type ElementType<K extends string, V> = {
	[N in K]: V;
};

export default function prop<K extends string, V>(
	name: K,
	getValue: () => V
): (element: ElementType<K, V>) => void {
	return function(element: ElementType<K, V>): void {
		effect(function() {
			element[name] = getValue();
		});
	};
}
