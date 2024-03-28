(function($, undefined) {

var isWritableSignal = $.isWritableSignal;

function bindNumber(signal, defaultValue) {
	if (!isWritableSignal(signal)) {
		throw new TypeError("Two-way data binding needs a writable signal");
	}
	
	function set() {
		if (this.value === "" && defaultValue !== undefined) {
			signal.set(defaultValue);
			return;
		}
		
		var value = parseFloat(this.value);
		
		if (!isNaN(value) && isFinite(value)) {
			signal.set(value);
		}
	}
	
	return {
		oninput: set,
		onchange: set,
		onkeyup: set,
		value: signal
	};
}

$.bindNumber = bindNumber;

})($);
