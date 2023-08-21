(function($){

var ticks = [];

function tick(callback){
	ticks.push(callback);
}

function callTicks(){
	var n = ticks.length;
	
	if( n ){
		var callbacks = ticks;
		ticks = [];
		
		for(var i=0; i<n; ++i){
			callbacks[i]();
		}
	}
}

$.callTicks = callTicks;
$.tick = tick;

})($);
