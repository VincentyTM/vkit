(function($) {

var createComponent = $.createComponent;
var getComponent = $.getComponent;
var onUnmount = $.onUnmount;

function signalEffect(callback) {
	var signal = this;
	var prev = getComponent(true);
	
	if (prev) {
		var component = createComponent(function() {
			callback(signal.get(), onUnmount);
		});
		
		component.render();
		
		return signal.subscribe(component.render);
	} else {
		callback(signal.get());
		
		return signal.subscribe(function(value) {
			callback(value);
		});
	}
}

$.signalEffect = signalEffect;

})($);
