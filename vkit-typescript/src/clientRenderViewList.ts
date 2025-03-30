import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { Injector } from "./createInjector.js";
import { Pushable } from "./deepPush.js";
import { destroyEffect } from "./destroyEffect.js";
import { hashCode } from "./hashCode.js";
import { insert } from "./insert.js";
import { isArray } from "./isArray.js";
import { nodeRange, NodeRange } from "./nodeRange.js";
import { Template } from "./Template.js";
import { throwError } from "./throwError.js";
import { toArray } from "./toArray.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { ViewListTemplate } from "./viewList.js";

export interface Block {
	effect: Effect;
	index: number;
	range: NodeRange;
	insertBefore(anchor: Node): void;
}

export function clientRenderViewList<T, P>(
	array: Pushable<Template<P>>,
	template: ViewListTemplate<T, P>
): void {
    var input = template.models;
    var getItemTemplate = template.getItemTemplate;
	var parentEffect = getEffect();
	var injector = parentEffect.injector;
	var range = nodeRange();
	var oldBlocks: {[key: string]: Block} = {};
	var blocksArray: Block[] = [];
	
	function render(models: ArrayLike<T>): void {
		if (!isArray(models)) {
			models = toArray(models);
		}
		
		var newBlocks: {[key: string]: Block} = {};
		var n = models.length;
		var newArray = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var model = models[i];
			var key = hashCode(model);
			
			while (key in newBlocks) {
				key = "_" + key;
			}
			
			var block = newArray[i] = newBlocks[key] = oldBlocks[key] || createBlock<T>(
				model,
				getItemTemplate,
				parentEffect,
				injector
			);

			block.index = i;
		}
		
		for (var key in oldBlocks) {
			if (!(key in newBlocks)) {
				var block = oldBlocks[key];
				block.range.remove();
				destroyEffect(block.effect);
			}
		}
		
		oldBlocks = newBlocks;
		
		if (range.start.nextSibling) {
			var m = blocksArray.length;
			var l = m;
			
			while (m > 0 && n > 0 && blocksArray[m - 1] === newArray[n - 1]) {
				--m;
				--n;
			}
			
			if (n === 0 && m === 0) {
				blocksArray = newArray;
				return;
			}
			
			var i = 0;
			var k = Math.min(m, n);
			var end = m < l ? blocksArray[m].range.start : range.end;
			
			while (i < k && blocksArray[i] === newArray[i]) {
				++i;
			}
			
			while (i < n) {
				newArray[i].insertBefore(end);
				++i;
			}
		}
		
		blocksArray = newArray;
	}
	
	input.subscribe(render);
	
	enqueueUpdate(function(): void {
		render(input.get());
	});
	
	array.push(range.start);
	array.push(range.end);
}

function createBlock<T>(
	model: T,
	getView: (value: T) => Template,
	container: Effect | undefined,
	injector: Injector | undefined
): Block {
	var range = nodeRange(true);
	
	var effect = createEffect(container, injector, function(): void {
		var view = getView(model);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(view);
		}
	});
	
	function render(): void {
		updateEffect(effect);
	}
	
	function insertBefore(end: Node): void {
		if (range.start.nextSibling) {
			range.insertBefore(end);
		} else {
			var prevEffect = getEffect(true);
			var prevInjector = getInjector(true);
			
			try {
				setEffect(effect);
				setInjector(injector);

				enqueueUpdate(render);

				insert([
					range.start,
					range.end
				], end, end.parentNode, true);
			} catch (error) {
				throwError(error, effect);
			} finally {
				setEffect(prevEffect);
				setInjector(prevInjector);
			}
		}
	}
	
	var block = {
		effect: effect,
		index: 0,
		insertBefore: insertBefore,
		range: range
	};

	return block;
}
