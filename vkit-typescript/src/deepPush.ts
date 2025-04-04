import { Bindings } from "./bind.js";
import { isCustomTemplate } from "./isCustomTemplate.js";
import { isSignal } from "./isSignal.js";
import { signalText } from "./signalText.js";
import { Template } from "./Template.js";
import { text } from "./text.js";
import { toArray } from "./toArray.js";

export interface ClientRenderer<P> {
	readonly array: Pushable;
	readonly context: P;
	bind(target: P, modifier: Bindings<P>): void;
}

export interface Pushable {
	push(value: Node): void;
}

function clientRenderNode<P>(clientRenderer: ClientRenderer<P>, node: Node): void {
	clientRenderer.array.push(node);
}

export function deepPush<P>(clientRenderer: ClientRenderer<P>, template: Template<P>): void {
	if (template === null || template === undefined || typeof template === "boolean") {
		return;
	}

	if (isSignal(template)) {
		clientRenderNode(clientRenderer, signalText(template));
		return;
	}
	
	if (isCustomTemplate(template)) {
		template.clientRender(clientRenderer, template);
		return;
	}

	if (typeof template === "function") {
		clientRenderNode(clientRenderer, text(template));
		return;
	}
	
	if (typeof template !== "object") {
		clientRenderNode(clientRenderer, document.createTextNode(String(template)));
		return;
	}
	
	if ("nodeType" in template) {
		clientRenderNode(clientRenderer, template);
		return;
	}
	
	if ("length" in template) {
		var n = template.length;
		var a = toArray(template);

		for (var i = 0; i < n; ++i) {
			deepPush(clientRenderer, a[i]);
		}

		return;
	}
	
	if ("next" in template) {
		var x: IteratorResult<Template<P>, Template<P>>;

		do {
			x = template.next();
			deepPush(clientRenderer, x.value);
		} while (!x.done);

		return;
	}
	
	clientRenderer.bind(clientRenderer.context, template);
}
