import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { hydrateViewList } from "./hydrateViewList.js";
import { serverRenderViewList } from "./serverRenderViewList.js";
import { CustomTemplate, Template } from "./Template.js";

export interface ViewListTemplate<T, P> extends CustomTemplate<P> {
	readonly models: Signal<readonly T[]>;
	readonly parentEffect: Effect;
	getItemTemplate(model: T): Template<P>;
}

/**
 * Creates a dynamic view list that efficiently updates the DOM based on changes
 * in an array of models. The rendered list automatically reflects any data changes.
 * 
 * When the array reference changes within the provided signal, the old and the new
 * arrays are compared. This ensures that:
 * - Items not present in the new array have their view blocks removed.
 * - If an item's position changes, the corresponding DOM elements are moved.
 * - Newly added items generate new view blocks in the DOM.
 * - Each duplicate value will have its own view block.
 * 
 * Since array items are compared by reference, it is highly recommended to use
 * primitive values when working with immutable data structures.
 * 
 * @example
 * function FruitList() {
 * 	const fruits = signal(["Apple", "Banana", "Orange"]);
 * 
 * 	return Ul(
 * 		viewList(fruits, (fruit) => {
 * 			return Li(fruit);
 * 		})
 * 	);
 * }
 * 
 * @param models A signal containing an array of items, where each item is passed as a
 * parameter to `getItemTemplate`, which returns a corresponding template to be rendered.
 * The view list will react to changes in this signal.
 * @param getItemTemplate A function that returns a template for each item in the array.
 * 
 * @returns A template that represents a dynamic view list.
 */
export function viewList<T, P extends ParentNode>(
	models: Signal<readonly T[]>,
	getItemTemplate: (model: T) => Template<P>
): ViewListTemplate<T, P> {
	return {
		models: models,
		parentEffect: getEffect(),
		getItemTemplate: getItemTemplate,
		hydrate: hydrateViewList,
		serverRender: serverRenderViewList
	};
}
