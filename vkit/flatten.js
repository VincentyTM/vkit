(function($){

var createState = $.state;
var readOnly = $.readOnly;

function flatten(input){
	var output = createState();
	
	input.effect(function(inner, cleanup){
		if( inner && typeof inner.get === "function" ){
			output.set(inner.get());
			
			if( typeof inner.subscribe === "function" ){
				inner.subscribe(function(value){
					output.set(value);
				});
			}
		}else{
			output.set(inner);
		}
	});
	
	return readOnly(output);
}

$.flatten = flatten;

})($);
