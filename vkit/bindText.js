(function($) {

var isWritableSignal = $.isWritableSignal;

function bindText(signal) {
	if (!isWritableSignal(signal)) {
		throw new TypeError("Two-way data binding needs a writable signal");
	}
	
	function update() {
		signal.set(this.value);
	}
	
	return {
		onchange: update,
		oninput: update,
		onkeyup: update,
		value: signal
	};
}

$.bindText = bindText;

})($);
