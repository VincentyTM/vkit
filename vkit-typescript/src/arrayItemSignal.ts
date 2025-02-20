import type { ComputedSignal } from "./computed.js";
import type { WritableSignal } from "./signal.js";
import writable from "./writable.js";

/**
 * Creates and returns a writable signal that reflects and updates an item of an array contained in another writable signal.
 * It can be used to update an array item while maintaining an immutable data structure.
 * Writing an array item signal is delayed until the next update, unlike a regular writable signal.
 * @example
 * function ShoppingList() {
 * 	const list = signal([
 * 		{
 * 			"id": 1,
 * 			"label": "Apple"
 * 		},
 * 		{
 * 			"id": 2,
 * 			"label": "Bread"
 * 		},
 * 		{
 * 			"id": 3,
 * 			"label": "Cheese"
 * 		}
 * 	]);
 * 
 * 	return Ul(
 * 		useKey(list, "id").views((item) => {
 * 			const listItem = arrayItemSignal(list, item);
 * 			const label = propertySignal(listItem, "label");
 * 			
 * 			return Li(
 * 				Input(bindText(label))
 * 			);
 * 		})
 * 	);
 * }
 * 
 * @param parent A writable signal that contains the array.
 * @param item A computed signal that contains the current array item. It is provided by `useKey`.
 * @returns A writable signal that contains the array item.
 */
export default function arrayItemSignal<T>(
	parent: WritableSignal<T[]>,
	item: ComputedSignal<T>
): WritableSignal<T> {
	var current: T = item.get();

	function set(value: T): void {
		if (current === value) {
			return;
		}

		var array = parent.get();

		for (var i = array.length; i--;) {
			if (array[i] === current) {
				parent.set(array.slice(0, i).concat([value], array.slice(i + 1)));
				break;
			}
		}
		
		current = value;
	}

	return writable(item, set);
}
