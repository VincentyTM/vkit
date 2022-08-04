(function($){

var callbacks = [];

function onReady(callback){
	callbacks.push(callback);
}

function ready(){
	var n = callbacks.length;
	var cbs = callbacks.splice(0, n);
	for(var i=0; i<n; ++i){
		callbacks[i].apply(null, arguments);
	}
}

$.onReady = onReady;
$.ready = ready;

})($);
