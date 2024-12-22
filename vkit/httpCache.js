(function($){

var readOnly = $.readOnly;
var signal = $.signal;

function noop(value) {
	return value;
}

function httpCache(params) {
	var httpState = params.http;
	var storageState = params.storage;
	var defaultValue = params.defaultValue;
	var parse = typeof params.parse === "function" ? params.parse : noop;
	var onError = typeof params.onError === "function" ? params.onError : noop;
	var state = signal(defaultValue);
	
	function setValue(value) {
		if (value === null || value === undefined) {
			state.set(defaultValue);
		} else {
			try {
				state.set(parse(value));
			} catch (ex) {
				onError(ex);
			}
		}
	}
	
	if (storageState) {
		if (typeof storageState.effect === "function") {
			storageState.effect(setValue);
		} else if (typeof storageState.get === "function") {
			setValue(storageState.get());
		}
	}
	
	if (httpState && typeof httpState.effect === "function") {
		httpState.effect(function(res) {
			if (res.unsent || res.progress) {
				return;
			}
			
			if (res.status === 200) {
				try {
					state.set(parse(res.body));
					
					if (storageState && typeof storageState.set === "function") {
						storageState.set(res.body);
					}
				} catch (ex) {
					onError(ex);
				}
			} else {
				onError(new Error("HTTP status is " + res.status));
			}
		});
	}
	
	return readOnly(state);
}

$.httpCache = httpCache;

})($);
