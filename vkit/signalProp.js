(function($) {

var getComponent = $.getComponent;

function signalProp(name) {
	var signal = this;
	var component = getComponent(true);
	
	return function(element) {
		element[name] = signal.get();
		
		signal.subscribe(function(value) {
			element[name] = value;
		}, signal.component === component);
	};
}

$.signalProp = signalProp;

})($);
