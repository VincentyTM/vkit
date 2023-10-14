(function($){

var getWindow = $.window;
var onUnmount = $.unmount;
var update = $.update;

var slice = Array.prototype.slice;

function createInterval(func, delay){
	var args = slice.call(arguments, 2);
	
	function tick(){
		func.apply(null, args);
		update();
	}
	
	function clear(){
		clearInterval(interval);
	}
	
	var interval = getWindow().setInterval(tick, delay);
	
	onUnmount(clear);
}

$.interval = createInterval;

})($);
