import { createEffect, Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { hashCode } from "./hashCode.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { isArray } from "./isArray.js";
import { Template } from "./template.js";
import { toArray } from "./toArray.js";
import { updateEffect } from "./updateEffect.js";
import { ViewListTemplate } from "./viewList.js";

interface Block {
	currentTemplate: Template;
	readonly effect: Effect;
	readonly end: ChildNode;
	readonly start: ChildNode;
}

export function hydrateViewList<T, P extends ParentNode>(pointer: HydrationPointer<P>, template: ViewListTemplate<T, P>): void {
	var listStart = document.createTextNode("");
	var listEnd = document.createTextNode("");
	var blockMap: Record<string, Block> = {};
	var blockArray: Block[] = [];
	var parentNode = pointer.context;
	var parentEffect = template.parentEffect;

	var listEffect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var models = template.models();
		var n = models.length;
		
		if (!isArray(models)) {
			models = toArray(models);
		}
		
		var newBlockMap: Record<string, Block> = {};
		var newBlockArray = new Array<Block>(n);
		var n = models.length;
		var oldBlockMap = blockMap;
		
		for (var i = 0; i < n; ++i) {
			var model: T = models[i];
			var key = hashCode(model);
			
			while (key in newBlockMap) {
				key = "_" + key;
			}
			
			var block = newBlockArray[i] = newBlockMap[key] = oldBlockMap[key] || createBlock<T, P>(
				pointer,
				model,
				template.getItemTemplate,
				parentEffect
			);
		}
		
		for (var key in oldBlockMap) {
			if (!(key in newBlockMap)) {
				var block = oldBlockMap[key];
				var blockStart = block.start;
				var blockEnd = block.end;

				clearRange(blockStart, blockEnd);

				if (blockStart.parentNode) {
					blockStart.parentNode.removeChild(blockStart);
				}

				if (blockEnd.parentNode) {
					blockEnd.parentNode.removeChild(blockEnd);
				}
				
				destroyEffect(block.effect);
			}
		}
		
		blockMap = newBlockMap;
		
		if (listStart.nextSibling) {
			var m = blockArray.length;
			var l = m;
			
			while (m > 0 && n > 0 && blockArray[m - 1] === newBlockArray[n - 1]) {
				--m;
				--n;
			}
			
			if (n === 0 && m === 0) {
				blockArray = newBlockArray;
				return;
			}
			
			var i = 0;
			var k = Math.min(m, n);
			var end = m < l ? blockArray[m].start : listEnd;
			
			while (i < k && blockArray[i] === newBlockArray[i]) {
				++i;
			}
			
			while (i < n) {
				var block = newBlockArray[i];

				if (block.start.parentNode) {
					insertRangeBefore(block.start, block.end, end);
				} else {
					var fragment = document.createDocumentFragment();
					fragment.appendChild(block.start);

					var fragmentPointer: HydrationPointer<DocumentFragment> = {
						context: fragment,
						currentNode: null,
						isSVG: pointer.isSVG,
						parentEffect: block.effect,
						stopNode: null
					};

					hydrate(fragmentPointer, block.currentTemplate);
					fragment.appendChild(block.end);
					parentNode.insertBefore(fragment, end);
				}

				++i;
			}
		} else {
			var n = newBlockArray.length;
			
			parentNode.insertBefore(listStart, pointer.currentNode);
		
			for (var i = 0; i < n; ++i) {
				var block = newBlockArray[i];
		
				parentNode.insertBefore(block.start, pointer.currentNode);
				
				var blockPointer: HydrationPointer<P> = {
					context: pointer.context,
					currentNode: pointer.currentNode,
					isSVG: pointer.isSVG,
					parentEffect: block.effect,
					stopNode: block.end
				};

				hydrate(blockPointer, block.currentTemplate);
				pointer.currentNode = blockPointer.currentNode;

				parentNode.insertBefore(block.end, pointer.currentNode);
			}
		
			parentNode.insertBefore(listEnd, pointer.currentNode);
		}

		blockArray = newBlockArray;
	});

	updateEffect(listEffect);
}

function clearRange(start: Node, end: Node): void {
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

function createBlock<T, P extends ParentNode>(
	pointer: HydrationPointer<P>,
	model: T,
	getItemTemplate: (value: T) => Template,
	parentEffect: Effect
): Block {
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var innerTemplate = block.currentTemplate = getItemTemplate(model);
		
		var parent = end.parentNode;
		
		if (parent) {
			clearRange(start, end);

			var fragment = document.createDocumentFragment();
			
			var fragmentPointer: HydrationPointer<DocumentFragment> = {
				context: fragment,
				currentNode: null,
				isSVG: pointer.isSVG,
				parentEffect: effect,
				stopNode: null
			};

			hydrate(fragmentPointer, innerTemplate);
			parent.insertBefore(fragment, end);
		}
	});
	
	var block: Block = {
		currentTemplate: undefined,
		effect: effect,
		end: end,
		start: start
	};

	updateEffect(effect);

	return block;
}

function insertRangeBefore(start: ChildNode, end: ChildNode, anchor: Node): void {
	var parent = anchor.parentNode;
	
	if (parent) {
		var fragment = document.createDocumentFragment();

		for (var el: ChildNode | null = start; el && el !== end; el = next) {
			var next: ChildNode | null = el.nextSibling;
			fragment.appendChild(el);
		}

		fragment.appendChild(end);
		parent.insertBefore(fragment, anchor);
	}
}
