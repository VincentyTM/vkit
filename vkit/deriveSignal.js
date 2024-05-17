(function($) {

var isWritableSignal = $.isWritableSignal;
var writable = $.writable;

function deriveSignal(parent, selector, updater) {
	if (!isWritableSignal(parent)) {
		throw new TypeError("Parent must be a writable signal");
	}
	
	if (typeof selector !== "function") {
		throw new TypeError("Selector must be a function");
	}
	
	if (typeof updater !== "function") {
		throw new TypeError("Updater must be a function");
	}
	
	var selected = parent.map(selector);
	
	return writable(selected, function(value) {
		if (selected.get() === value) {
			return;
		}
		
		parent.setEagerly(updater(parent.get(), value));
	});
}

$.deriveSignal = deriveSignal;

})($);
