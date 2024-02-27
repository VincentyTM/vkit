import createTextNode from "./createTextNode.js";
import toArray from "./toArray.js";

export default function deepPush(array, item, context, bind) {
	if (item === null || item === undefined || item === true || item === false) {
		return array;
	}
	
	if (typeof item.render === "function") {
		deepPush(array, item.render(), context, bind);
		return array;
	}
	
	if (typeof item === "function") {
		deepPush(array, item(context), context, bind);
		return array;
	}
	
	if (typeof item !== "object") {
		array.push(createTextNode(item));
		return array;
	}
	
	if (item.toHTML) {
		array.push(item);
		return array;
	}
	
	if (typeof item.length === "number") {
		var n = item.length;
		var a = toArray(item);
		
		for (var i = 0; i < n; ++i) {
			deepPush(array, a[i], context, bind);
		}
		
		return array;
	}
	
	if (typeof item.next === "function") {
		var x;
		
		do {
			x = item.next();
			deepPush(array, x.value, context, bind);
		} while (!x.done);
		
		return array;
	}
	
	if (bind) {
		bind(context, item);
		return array;
	}
	
	return array;
}
