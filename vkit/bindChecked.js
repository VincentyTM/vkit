(function($) {

var isWritableSignal = $.isWritableSignal;

function bindChecked(signal) {
	if (!isWritableSignal(signal)) {
		throw new TypeError("Two-way data binding needs a writable signal");
	}
	
	return {
		checked: signal,
		onchange: function() {
			signal.set(this.checked);
		}
	};
}

$.bindChecked = bindChecked;

})($);
