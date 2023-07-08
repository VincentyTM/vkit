(function($){

var unmount = $.unmount;
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
	
	var interval = setInterval(tick, delay);
	unmount(clear);
	
	return {
		clear: clear
	};
}

$.interval = createInterval;

})($);
