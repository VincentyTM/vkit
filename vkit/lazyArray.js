(function($){

var createState = $.state;
var unmount = $.unmount;
var render = $.render;

function createLazyArray(arrayState){
	var interval = 0;
	var optimized = createState([]);
	arrayState.effect(function(array){
		clearInterval(interval);
		var opt = optimized.get();
		var n = opt.length;
		var m = array.length;
		if( m - n <= 3 ){
			optimized.set(array);
		}else{
			n += 10;
			optimized.set(array.slice(0, n));
			interval = setInterval(function(){
				n += 10;
				if( m <= n ){
					clearInterval(interval);
				}
				optimized.set(array.slice(0, n));
				render();
			}, 1);
		}
	});
	unmount(function(){
		clearInterval(interval);
	});
	return optimized;
}

$.lazyArray = createLazyArray;

})($);
