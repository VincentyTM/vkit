(function($, undefined) {

var getEffect = $.getEffect;
var observable = $.observable;
var onDestroy = $.onDestroy;
var setEffect = $.setEffect;
var signal = $.signal;
var update = $.update;

function useGenerator(generator, updater) {
	function next() {
		var current = generator.next();
		
		if (current && typeof current.then === "function") {
			current.then(function(curr) {
				gen.set(curr.value);
				cleanup();
				cleanup.clear();
				
				if (!curr.done && autoNext) {
					next();
				}
				
				update();
			});
		} else {
			if (!current.done || current.value !== undefined) {
				gen.set(current.value);
			}
		}
	}
	
	if (typeof generator === "function") {
		return function() {
			function cleanup(callback) {
				g.unmount(callback);
			}
			
			var g = createGeneratorSignal(generator.apply(
				{unmount: cleanup},
				arguments
			));
			
			return g;
		};
	}
	
	var cleanup = observable();
	var autoNext = typeof updater !== "function";
	var prev = getEffect();
	var gen = signal();
	
	setEffect(null);
	next();
	setEffect(prev);
	
	if (autoNext) {
		onDestroy(function() {
			autoNext = false;
			cleanup();
		});
	} else {
		updater(next);
	}
	
	gen.unmount = cleanup.subscribe;
	
	return gen;
}

$.generator = useGenerator;

})($);
