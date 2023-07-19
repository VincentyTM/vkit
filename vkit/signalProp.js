(function($){

function signalProp(key){
	var signal = this;
	
	return function(node){
		node[key] = signal.get();
		
		signal.subscribe(function(value){
			node[key] = value;
		});
	};
}

$.signalProp = signalProp;

})($);
