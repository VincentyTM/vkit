(function($){

var ticks = [];

function addTick(callback){
	ticks.push(callback);
}

function callTicks(){
	var n = ticks.length;
	if( n ){
		var callbacks = ticks.splice(0, n);
		for(var i=0; i<n; ++i){
			callbacks[i]();
		}
	}
}

$.callTicks = callTicks;
$.tick = addTick;

})($);
