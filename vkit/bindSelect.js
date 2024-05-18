(function($) {

var isWritableSignal = $.isWritableSignal;
var tick = $.tick;

function bindSelect(signal) {
	if (!isWritableSignal(signal)) {
		throw new TypeError("Two-way data binding needs a writable signal");
	}
	
	return [
		function(el) {
			function updateValue() {
				el.value = signal.get();
			}
			
			signal.effect(function() {
				tick(updateValue);
			});
		},
		
		{
			onchange: function() {
				signal.set(this.value);
			}
		}
	];
}

$.bindSelect = bindSelect;

})($);
