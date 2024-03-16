(function($) {

var isWritableSignal = $.isWritableSignal;
var tick = $.tick;

function bindSelect(signal) {
	if (!isWritableSignal(signal)) {
		throw new TypeError("A <select> can only be bound to a writable signal");
	}
	
	return [
		function(el) {
			tick(function() {
				el.value = signal.get();
			});
		},
		
		{
			value: signal,
			onchange: function() {
				signal.set(this.value);
			}
		}
	];
}

$.bindSelect = bindSelect;

})($);
