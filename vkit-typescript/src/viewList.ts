import { Signal } from "./computed.js";
import { Template } from "./Template.js";

export function viewList<T, P extends Element>(
	models: Signal<ArrayLike<T>>,
	getItemTemplate: (model: T) => Template<P>
): Template<P> {
    return models.views(getItemTemplate);
}
