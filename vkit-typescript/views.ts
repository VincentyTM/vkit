import bind from "./bind";
import createComponent from "./component";
import createNodeRange from "./nodeRange";
import emitUnmount from "./emitUnmount";
import {getComponent, getProvider, setComponent, setProvider} from "./contextGuard";
import hashCode from "./hashCode";
import insert from "./insert";
import isArray from "./isArray";
import throwError from "./throwError";
import toArray from "./toArray";

import type {Component} from "./component";
import type {NodeRange} from "./nodeRange";
import type {Provider} from "./inject";
import type {Signal} from "./signal";
import type {View} from "./view";

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
	provider: Provider | null
): Block {
	var range = createNodeRange();
	var view: View;
	
	var component = createComponent(function(){
		view = getView(model);
		
		if( range.start.nextSibling ){
			range.clear();
			range.append(view);
		}
	}, container, provider);
	
	component.render();
	
	function render(){
		return [
			range.start,
			view,
			range.end
		];
	}
	
	function insertBefore(end: Node){
		if( range.start.nextSibling ){
			range.insertBefore(end);
		}else{
			var prevComponent = getComponent(true);
			var prevProvider = getProvider(true);
			
			try{
				setComponent(component);
				setProvider(provider);
				insert(render(), end, end.parentNode as Node, bind);
			}catch(error){
				throwError(error, component);
			}finally{
				setComponent(prevComponent);
				setProvider(prevProvider);
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

function views<ValueType>(
	this: Signal<ArrayLike<ValueType>>,
	getView: (value: ValueType) => View
){
	var signal = this;
	var container = getComponent();
	var provider = getProvider();
	var range = createNodeRange();
	var oldBlocks: {[key: string]: Block} = {};
	var array: Block[];
	
	function render(models: ArrayLike<ValueType>){
		if(!isArray(models)){
			models = toArray(models);
		}
		
		var newBlocks: {[key: string]: Block} = {};
		var n = models.length;
		var newArray = new Array(n);
		
		for(var i=0; i<n; ++i){
			var model = models[i];
			var key = hashCode(model);
			
			while( key in newBlocks ){
				key = "_" + key;
			}
			
			newArray[i] = newBlocks[key] = oldBlocks[key] || createBlock<ValueType>(
				model,
				getView,
				container,
				provider
			);
		}
		
		for(var key in oldBlocks){
			if(!(key in newBlocks)){
				var block = oldBlocks[key];
				block.range.remove();
				emitUnmount(block.component);
			}
		}
		
		oldBlocks = newBlocks;
		
		if( range.start.nextSibling ){
			var m = array.length;
			var l = m;
			
			while( m > 0 && n > 0 && array[m - 1] === newArray[n - 1] ){
				--m;
				--n;
			}
			
			if( n === 0 && m === 0 ){
				array = newArray;
				return;
			}
			
			var i = 0;
			var k = Math.min(m, n);
			var end = m < l ? array[m].range.start : range.end;
			
			while( i < k && array[i] === newArray[i] ){
				++i;
			}
			
			while( i < n ){
				newArray[i].insertBefore(end);
				++i;
			}
		}
		
		array = newArray;
	}
	
	render(signal.get());
	signal.subscribe(render);
	
	var n = array!.length;
	var output = new Array(n + 2);
	
	for(var i=0; i<n; ++i){
		output[i + 1] = array![i].render();
	}
	
	output[0] = range.start;
	output[n + 1] = range.end;
	
	return output;
}

export default views;
