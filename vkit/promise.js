(function($) {

var readOnly = $.readOnly;
var signal = $.signal;
var thenable = $.thenable;

function createPromise(callback) {
	var state = signal({pending: true});
	
	function resolve(value) {
		if (state.get().pending) {
			state.set({fulfilled: true, value: value});
		}
	}
	
	function reject(error) {
		if (state.get().pending) {
			state.set({rejected: true, error: error});
		}
	}
	
	callback(resolve, reject);
	
	return thenable(readOnly(state));
}

$.promise = createPromise;

})($);
