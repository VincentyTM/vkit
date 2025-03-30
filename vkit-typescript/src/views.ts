import { Signal } from "./computed.js";
import { Template } from "./Template.js";
import { BlockInfo, viewList } from "./viewList.js";

export function views<T, P>(
	this: Signal<ArrayLike<T>>,
	getItemTemplate: (item: T, block?: BlockInfo) => Template<P>
): Template<P> {
	return viewList(this, getItemTemplate);
}
