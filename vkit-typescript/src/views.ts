import { Signal } from "./computed.js";
import { getEffect, getInjector, setEffect, setInjector } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { Injector } from "./createInjector.js";
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

type Block = {
	effect: Effect;
	index: number;
	insertBefore(anchor: Node): void;
	range: NodeRange;
};

type BlockInfo = {
	index: number;
};

function createBlock<ItemT>(
	model: ItemT,
	getView: (value: ItemT, block?: BlockInfo) => Template,
	container: Effect | undefined,
	injector: Injector | undefined
): Block {
	var range = nodeRange(true);
	
	var effect = createEffect(container, injector, function(): void {
		var view = getView(model, block);
		
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

export function views<ViewT extends Template<ContextT>, ItemT, ContextT>(
	this: Signal<ArrayLike<ItemT>>,
	getItemView: (item: ItemT, block?: BlockInfo) => ViewT
): Template<ContextT> {
	var signal = this;
	var container = getEffect();
	var injector = getInjector();
	var range = nodeRange();
	var oldBlocks: {[key: string]: Block} = {};
	var array: Block[] = [];
	
	function render(models: ArrayLike<ItemT>): void {
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
			
			var block = newArray[i] = newBlocks[key] = oldBlocks[key] || createBlock<ItemT>(
				model,
				getItemView,
				container,
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
			var m = array.length;
			var l = m;
			
			while (m > 0 && n > 0 && array[m - 1] === newArray[n - 1]) {
				--m;
				--n;
			}
			
			if (n === 0 && m === 0) {
				array = newArray;
				return;
			}
			
			var i = 0;
			var k = Math.min(m, n);
			var end = m < l ? array[m].range.start : range.end;
			
			while (i < k && array[i] === newArray[i]) {
				++i;
			}
			
			while (i < n) {
				newArray[i].insertBefore(end);
				++i;
			}
		}
		
		array = newArray;
	}
	
	signal.subscribe(render);
	
	enqueueUpdate(function(): void {
		render(signal.get());
	});
	
	return [
		range.start,
		range.end
	];
}
