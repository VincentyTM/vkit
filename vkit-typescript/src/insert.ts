import { bind } from "./bind.js";
import { Effect } from "./createEffect.js";
import { ClientRenderer, deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

interface Inserter<P> extends ClientRenderer<P> {
	readonly fragment: DocumentFragment | null;
	readonly nextSibling: Node;
}

function insertNode(this: Inserter<ParentNode>, node: Node): void {
	if (this.fragment) {
		this.fragment.appendChild(node);
	} else {
		this.context.insertBefore(node, this.nextSibling);
	}
}

export function insert<P extends ParentNode>(
	children: Template<P>,
	nextSibling: Node,
	context: P,
	parentEffect: Effect
): void {
	var fragment = document.createDocumentFragment ? document.createDocumentFragment() : null;

	var inserter: Inserter<P> = {
		context: context,
		fragment: fragment,
		nextSibling: nextSibling,
		parentEffect: parentEffect,
		add: insertNode,
		bind: bind
	};
	
	deepPush(inserter, children);

	if (fragment) {
		context.insertBefore(fragment, nextSibling);
	}
}
