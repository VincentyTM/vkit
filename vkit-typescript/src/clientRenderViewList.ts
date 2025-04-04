import { getEffect } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { Pushable } from "./deepPush.js";
import { destroyEffect } from "./destroyEffect.js";
import { hashCode } from "./hashCode.js";
import { insert } from "./insert.js";
import { isArray } from "./isArray.js";
import { Template } from "./Template.js";
import { toArray } from "./toArray.js";
import { updateEffect } from "./updateEffect.js";
import { ViewListTemplate } from "./viewList.js";

export interface Block {
	readonly effect: Effect;
	readonly end: ChildNode;
	readonly start: ChildNode;
}

export function clientRenderViewList<T, P extends ParentNode>(
	_array: Pushable<Template<P>>,
	template: ViewListTemplate<T, P>,
	parentElement: P
): void {
	var listStart = document.createTextNode("");
	var listEnd = document.createTextNode("");
    var input = template.models;
    var getItemTemplate = template.getItemTemplate;
	var parentEffect = getEffect();
	var blockMap: Record<string, Block> = {};
	var blockArray: Block[] = [];
	
	function render(models: ArrayLike<T>): void {
		if (!isArray(models)) {
			models = toArray(models);
		}
		
		var n = models.length;
		var newBlockArray = new Array<Block>(n);
		var newBlockMap: Record<string, Block> = {};
		
		for (var i = 0; i < n; ++i) {
			var model = models[i];
			var key = hashCode(model);
			
			while (key in newBlockMap) {
				key = "_" + key;
			}
			
			var block = newBlockArray[i] = newBlockMap[key] = blockMap[key] || createBlock<T>(
				model,
				getItemTemplate,
				parentEffect
			);
		}
		
		for (var key in blockMap) {
			if (!(key in newBlockMap)) {
				var block = blockMap[key];
				var blockStart = block.start;
				var blockEnd = block.end;

				clearRange(blockStart, blockEnd);

				var blockParent = blockStart.parentNode;

				if (blockParent) {
					blockParent.removeChild(blockStart);
					blockParent.removeChild(blockEnd);
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

				if (block.start.nextSibling) {
					insertRangeBefore(block.start, block.end, end);
				} else {
					var listParent = end.parentNode;

					if (listParent) {
						listParent.insertBefore(block.start, end);
						listParent.insertBefore(block.end, end);
					}

					updateEffect(block.effect);
				}

				++i;
			}
		} else {
			var m = newBlockArray.length;
		
			parentElement.appendChild(listStart);
			parentElement.appendChild(listEnd);
		
			for (var i = 0; i < m; ++i) {
				var block = newBlockArray[i];
				parentElement.insertBefore(block.start, listEnd);
				parentElement.insertBefore(block.end, listEnd);
				updateEffect(block.effect);
			}
		}
		
		blockArray = newBlockArray;
	}
	
	input.effect(render);
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

function createBlock<T>(
	model: T,
	getItemTemplate: (value: T) => Template,
	parentEffect: Effect
): Block {
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	var effect = createEffect(parentEffect, parentEffect.injector, function(): void {
		var itemTemplate = getItemTemplate(model);
		
		if (start.nextSibling) {
			clearRange(start, end);
			insert(itemTemplate, end, start.parentNode, true);
		}
	});
	
	var block: Block = {
		effect: effect,
		end: end,
		start: start
	};

	return block;
}

function insertRangeBefore(start: ChildNode, end: ChildNode, anchor: Node): void {
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
