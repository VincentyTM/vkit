(function($){

var createSignal = $.signal;
var inject = $.inject;
var selectProperty = $.selectProperty;

function isSignal(value){
	return Boolean(value) && typeof value.effect === "function";
}

function select(key, factory){
	return selectProperty(this, key, factory);
}

function createStore(signal, factory){
	if(!isSignal(signal)){
		signal = createSignal(signal);
	}
	
	if(!signal.select){
		signal.select = select;
	}
	
	return signal;
}

function Store(){
	if(!(this instanceof Store)){
		return inject(Store).store;
	}
	
	this.store = createStore({});
}

$.rootStore = Store;
$.store = createStore;

})($);
