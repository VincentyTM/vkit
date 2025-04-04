import { Signal } from "./computed.js";
import { Template } from "./Template.js";
import { viewList } from "./viewList.js";

export function views<T, P extends ParentNode>(
	this: Signal<ArrayLike<T>>,
	getItemTemplate: (item: T) => Template<P>
): Template<P> {
	return viewList(this, getItemTemplate);
}
