(function($, undefined){

var createObservable = $.observable;
var createSignal = $.signal;
var getComponent = $.getComponent;
var onUnmount = $.unmount;
var setComponent = $.setComponent;
var update = $.update;

function createGeneratorSignal(generator, updater){
	function next(){
		var current = generator.next();
		if( current && typeof current.then === "function" ){
			current.then(function(curr){
				signal.set(curr.value);
				cleanup();
				cleanup.clear();
				
				if(!curr.done && autoNext){
					next();
				}
				
				update();
			});
		}else{
			if(!current.done || current.value !== undefined){
				signal.set(current.value);
			}
		}
	}
	
	if( typeof generator === "function" ){
		return function(){
			function cleanup(callback){
				signal.unmount(callback);
			}
			
			var signal = createGeneratorSignal(generator.apply(
				{unmount: cleanup},
				arguments
			));
			
			return signal;
		};
	}
	
	var cleanup = createObservable();
	var autoNext = typeof updater !== "function";
	var prev = getComponent();
	var signal = createSignal();
	
	setComponent(null);
	next();
	setComponent(prev);
	
	if( autoNext ){
		onUnmount(function(){
			autoNext = false;
			cleanup();
		});
	}else{
		updater(next);
	}
	
	state.unmount = cleanup.subscribe;
	
	return state;
}

$.generator = createGeneratorSignal;

})($);
