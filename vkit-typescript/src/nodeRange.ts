import { insert } from "./insert.js";
import { remove } from "./remove.js";
import { Template } from "./Template.js";

export interface NodeRange {
	readonly end: ChildNode;
	readonly start: ChildNode;
	append(...children: Template[]): void;
	clear(): void;
	insertBefore(anchor: Node): void;
	remove(): void;
}

export function nodeRange() : NodeRange {
	var start: ChildNode = document.createTextNode("");
	var end: ChildNode = document.createTextNode("");
	
	function clear(): void {
		if (!start.nextSibling) {
			throw new Error("Cannot clear detached range");
		}
		
		var parent = start.parentNode;
		
		if (parent) {
			for (var el = end.previousSibling; el && el !== start; el = end.previousSibling) {
				parent.removeChild(el);
			}
		}
	}
	
	function removeRange(): void {
		clear();
		remove(start);
		remove(end);
	}
	
	function append(): void {
		var parentNode = start.parentNode;
		
		if (!parentNode) {
			throw new Error("Cannot append to detached range");
		}

		insert(arguments, end, parentNode);
	}
	
	function insertBefore(anchor: Node): void {
		if (!start.nextSibling) {
			throw new Error("Cannot insert detached range");
		}
		
		var parent = anchor.parentNode;
		
		if (parent) {
			for (var el: ChildNode | null = start; el && el !== end; el = next) {
				var next: ChildNode | null = el.nextSibling;
				parent.insertBefore(el, anchor);
			}
			parent.insertBefore(end, anchor);
		}
	}
	
	return {
		append: append,
		clear: clear,
		end: end,
		insertBefore: insertBefore,
		remove: removeRange,
		start: start
	};
}
