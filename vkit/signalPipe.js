(function($){

function signalPipe(output, transform){
	var input = this;
	var hasTransform = typeof transform === "function";
	
	function update(value){
		output.set(hasTransform ? transform(value, output.get()) : value);
	}
	
	input.effect(update);
}

$.signalPipe = signalPipe;

})($);
