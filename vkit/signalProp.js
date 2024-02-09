(function($) {

function signalProp(name) {
	var signal = this;
	
	return function(element) {
		element[name] = signal.get();
		
		signal.subscribe(function(value) {
			element[name] = value;
		});
	};
}

$.signalProp = signalProp;

})($);
