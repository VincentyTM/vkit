import { Bindings } from "./bind.js";
import { isCustomTemplate } from "./isCustomTemplate.js";
import { isSignal } from "./isSignal.js";
import { signalText } from "./signalText.js";
import { Template } from "./Template.js";
import { text } from "./text.js";
import { toArray } from "./toArray.js";

export interface Pushable<T> {
	push(value: T | Text): number | void;
}

export function deepPush<P>(
	array: Pushable<Template<P>>,
	template: Template<P>,
	context: P,
	bind: (
		target: P,
		modifier: Bindings<P>,
		isExternal: boolean
	) => void,
	crossView: boolean
): Pushable<Template<P>> {
	if (template === null || template === undefined || typeof template === "boolean") {
		return array;
	}

	if (isSignal(template)) {
		array.push(signalText(template));
		return array;
	}
	
	if (isCustomTemplate(template)) {
		template.clientRender(array, template, context, crossView);
		return array;
	}

	if (typeof template === "function") {
		array.push(text(template));
		return array;
	}
	
	if (typeof template !== "object") {
		array.push(document.createTextNode(String(template)));
		return array;
	}
	
	if ("nodeType" in template) {
		array.push(template);
		return array;
	}
	
	if ("length" in template) {
		var n = template.length;
		var a = toArray(template);

		for (var i = 0; i < n; ++i) {
			deepPush(array, a[i], context, bind, crossView);
		}

		return array;
	}
	
	if ("next" in template) {
		var x: IteratorResult<Template<P>, Template<P>>;

		do {
			x = template.next();
			deepPush(array, x.value, context, bind, crossView);
		} while (!x.done);

		return array;
	}
	
	if (bind) {
		bind(context, template, !crossView);
		return array;
	}

	return array;
}
