import createComponent, {Component} from "./component";
import createNodeRange from "./nodeRange";
import emitUnmount from "./emitUnmount";
import {getComponent, getInjector, setComponent, setInjector} from "./contextGuard";
import hashCode from "./hashCode";
import {Injector} from "./injector";
import insert from "./insert";
import isArray from "./isArray";
import {NodeRange} from "./nodeRange";
import {Signal} from "./signal";
import throwError from "./throwError";
import toArray from "./toArray";
import {View} from "./view";

type Block = {
	component: Component;
	insertBefore(anchor: Node): void;
	range: NodeRange;
	render(): View;
};

function createBlock<ValueType>(
	model: ValueType,
	getView: (value: ValueType) => View,
	container: Component | null,
	injector: Injector | null
): Block {
	var range = createNodeRange();
	var view: View;
	
	var component = createComponent(function() {
		view = getView(model);
		
		if (range.start.nextSibling) {
			range.clear();
			range.append(view);
		}
	}, container, injector);
	
	component.render();
	
	function render() {
		return [
			range.start,
			view,
			range.end
		];
	}
	
	function insertBefore(end: Node) {
		if (range.start.nextSibling) {
			range.insertBefore(end);
		} else {
			var prevComponent = getComponent(true);
			var prevInjector = getInjector(true);
			
			try {
				setComponent(component);
				setInjector(injector);
				insert(render(), end, end.parentNode as Node);
			} catch (error) {
				throwError(error, component);
			} finally {
				setComponent(prevComponent);
				setInjector(prevInjector);
			}
		}
	}
	
	return {
		component: component,
		insertBefore: insertBefore,
		range: range,
		render: render
	};
}

export default function views<ValueType, ContextType>(
	this: Signal<ArrayLike<ValueType>>,
	getItemView: (value: ValueType) => View<ContextType>
): View<ContextType>[] {
	var signal = this;
	var container = getComponent();
	var injector = getInjector();
	var range = createNodeRange();
	var oldBlocks: {[key: string]: Block} = {};
	var array: Block[];
	
	function render(models: ArrayLike<ValueType>) {
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
			
			newArray[i] = newBlocks[key] = oldBlocks[key] || createBlock<ValueType>(
				model,
				getItemView,
				container,
				injector
			);
		}
		
		for (var key in oldBlocks) {
			if (!(key in newBlocks)) {
				var block = oldBlocks[key];
				block.range.remove();
				emitUnmount(block.component);
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
	
	render(signal.get());
	signal.subscribe(render);
	
	var n = array!.length;
	var output: View<ContextType>[] = new Array(n + 2);
	
	for (var i = 0; i < n; ++i) {
		output[i + 1] = array![i].render();
	}
	
	output[0] = range.start;
	output[n + 1] = range.end;
	
	return output;
}
