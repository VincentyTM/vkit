(function($, undefined){

var createObservable = $.observable;
var createState = $.state;
var getComponent = $.getComponent;
var setComponent = $.setComponent;
var unmount = $.unmount;
var update = $.update;

function createGeneratorState(generator, updater){
	function next(){
		var current = generator.next();
		if( current && typeof current.then === "function" ){
			current.then(function(curr){
				state.set(curr.value);
				cleanup();
				cleanup.clear();
				
				if(!curr.done && autoNext){
					next();
				}
				
				update();
			});
		}else{
			if(!current.done || current.value !== undefined){
				state.set(current.value);
			}
		}
	}
	
	if( typeof generator === "function" ){
		return function(){
			function cleanup(callback){
				state.unmount(callback);
			}
			
			var state = createGeneratorState(generator.apply({unmount: cleanup}, arguments));
			
			return state;
		};
	}
	
	var cleanup = createObservable();
	var autoNext = typeof updater !== "function";
	var prev = getComponent();
	setComponent(null);
	var state = createState();
	next();
	setComponent(prev);
	
	if( autoNext ){
		unmount(function(){
			autoNext = false;
			cleanup();
		});
	}else{
		updater(next);
	}
	
	state.unmount = cleanup.subscribe;
	
	return state;
}

$.generatorState = createGeneratorState;

})($);
