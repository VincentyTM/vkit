import { Bindings } from "./bind.js";
import { ClientRenderer, deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

interface Appender<P> extends ClientRenderer<P> {
	readonly fragment: DocumentFragment | null;
}

function appendNode(this: Appender<ParentNode>, node: Node): void {
	if (this.fragment) {
		this.fragment.appendChild(node);
	} else {
		this.context.appendChild(node);
	}
}

export function append<P extends ParentNode>(
	parent: P,
	children: Template<P>,
	context: P,
	bind: (target: P, modifier: Bindings<P>) => void
): void {
	var fragment = document.createDocumentFragment ? document.createDocumentFragment() : null;

	var appender: Appender<P> = {
		context: context,
		fragment: fragment,
		add: appendNode,
		bind: bind
	};
	
	deepPush(appender, children);

	if (fragment) {
		parent.appendChild(fragment);
	}
}
