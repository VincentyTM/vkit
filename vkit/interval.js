(function($){

var unmount = $.unmount;
var render = $.render;
var slice = Array.prototype.slice;

function createInterval(func, delay){
	var args = slice.call(arguments, 2);
	function tick(){
		func.apply(null, args);
		render();
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
