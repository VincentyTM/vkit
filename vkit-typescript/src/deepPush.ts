import { Bindings } from "./bind.js";
import { directive } from "./directive.js";
import { isCustomTemplate } from "./isCustomTemplate.js";
import { isSignal } from "./isSignal.js";
import { signalText } from "./signalText.js";
import { toArray } from "./toArray.js";

export interface Pushable<ItemType> {
	push(value: ItemType | Text): number | void;
}

export function deepPush<ItemT, ContextT>(
	array: Pushable<ItemT>,
	item: ItemT,
	context: ContextT,
	bind: (
		target: ContextT,
		modifier: ItemT & Bindings<ContextT>,
		isExternal?: boolean
	) => void,
	crossView: boolean
): Pushable<ItemT> {
	if (item === null || item === undefined || typeof item === "boolean") {
		return array;
	}

	if (isSignal(item)) {
		array.push(signalText(item));
		return array;
	}
	
	if (isCustomTemplate(item)) {
		item.clientRender(array, item, context, crossView);
		return array;
	}

	if (typeof item === "function") {
		if (directive) {
			var returnValue = directive(context, item as unknown as (element: ContextT) => string | void) as unknown as ItemT;
			deepPush(array, returnValue, context, bind, crossView);
		} else {
			item(context);
		}
		return array;
	}
	
	if (typeof item !== "object") {
		array.push(document.createTextNode(item as any));
		return array;
	}
	
	if ((item as any).nodeType) {
		array.push(item);
		return array;
	}
	
	if (typeof (item as any).length === "number") {
		var n = (item as any).length;
		var a = toArray<any>(item as any);

		for (var i = 0; i < n; ++i) {
			deepPush(array, a[i], context, bind, crossView);
		}

		return array;
	}
	
	if (typeof (item as any).next === "function") {
		var x: any;

		do {
			x = (item as any).next();
			deepPush(array, x.value, context, bind, crossView);
		} while (!x.done);

		return array;
	}
	
	if (bind) {
		bind(context, item, !crossView);
		return array;
	}

	return array;
}
