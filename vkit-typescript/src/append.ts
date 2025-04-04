import { Bindings } from "./bind.js";
import { deepPush } from "./deepPush.js";
import { Template } from "./Template.js";

export function append<P>(
	parent: {
		appendChild<T extends Node>(node: T): T | void;
		append?(...nodes: Template<P>[]): void;
	},
	children: Template<P>,
	context: P,
	bind: (target: P, modifier: Bindings<P>) => void
): void {
	function push(node: Node): void {
		parent.appendChild(node);
	}
	
	if (parent.append) {
		var array: Template<P>[] = [];
		
		deepPush({
			array: array,
			context: context,
			bind: bind
		}, children);
		
		parent.append.apply(parent, array);
	} else {
		deepPush({
			array: {push: push},
			context: context,
			bind: bind
		}, children);
	}
}
