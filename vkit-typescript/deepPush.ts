import {Bindings} from "./bind";
import directive from "./directive";
import toArray from "./toArray";

type Pushable<ItemType> = {
	push(value: ItemType | Text): number | void;
};

export default function deepPush<ItemType, ContextType>(
	array: Pushable<ItemType>,
	item: ItemType,
	context: ContextType,
	bind?: (
		target: ContextType,
		modifier: ItemType & Bindings<ContextType>,
		isExternal?: boolean
	) => void
): Pushable<ItemType> {
	if (item === null || item === undefined || typeof item === "boolean") {
		return array;
	}
	
	if (typeof (item as any).render === "function") {
		deepPush(array, (item as any).render(), context, bind);
		return array;
	}

	if (typeof item === "function") {
		if (directive) {
			var returnValue = directive(context, item as unknown as (element: ContextType) => string | void) as unknown as ItemType;
			deepPush(array, returnValue, context, bind);
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
	
	if( typeof (item as any).length === "number" ){
		var n = (item as any).length;
		var a = toArray<any>(item as any);

		for (var i = 0; i < n; ++i) {
			deepPush(array, a[i], context, bind);
		}

		return array;
	}
	
	if (typeof (item as any).next === "function") {
		var x;

		do {
			x = (item as any).next();
			deepPush(array, x.value, context, bind);
		} while (!x.done);

		return array;
	}
	
	if (bind) {
		bind(context, item, true);
		return array;
	}

	return array;
}
