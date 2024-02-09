(function($) {

var signal = $.signal;
var onUnmount = $.onUnmount;
var update = $.update;

function lazyArray(arraySignal, backwards) {
	var optimized = signal([]);
	
	arraySignal.effect(function(array) {
		var opt = optimized.get();
		var n = opt.length;
		var m = array.length;
		
		if (m - n <= 3) {
			optimized.set(array);
		} else {
			n += 10;
			optimized.set(backwards ? array.slice(m - n) : array.slice(0, n));
			
			var interval = setInterval(function() {
				n += 10;
				
				if (m <= n) {
					clearInterval(interval);
				}
				
				optimized.set(backwards ? array.slice(m - n) : array.slice(0, n));
				update();
			}, 1);
			
			onUnmount(function() {
				clearInterval(interval);
			});
		}
	});
	
	return optimized;
}

$.lazyArray = lazyArray;

})($);
