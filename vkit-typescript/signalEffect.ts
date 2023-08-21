import createComponent from "./component";
import {getComponent} from "./contextGuard";
import onUnmount from "./onUnmount";

import type {Component} from "./component";
import type {Signal} from "./signal";

function signalEffect<ValueType>(
	this: Signal<ValueType>,
	callback: (
		value: ValueType,
		onCleanup?: (
			callback: () => void,
			component?: Component | null
		) => (callback: () => void) => void
	) => void
){
	var signal = this;
	var prev = getComponent(true);
	
	if( prev ){
		var component = createComponent(function(){
			callback(signal.get(), onUnmount);
		});
		
		component.render();
		
		return signal.subscribe(component.render);
	}else{
		callback(signal.get());
		
		return signal.subscribe(function(value: ValueType){
			callback(value);
		});
	}
}

export default signalEffect;
