(function($, undefined) {

var createSignal = $.signal;
var inject = $.inject;
var noop = $.noop;
var onUnmount = $.onUnmount;
var WindowService = $.WindowService;

function getValue(parts, value) {
	var n = parts.length;
	
	for (var i = 0; i < n; ++i) {
		var part = parts[i];
		
		if (part && typeof part.get === "function") {
			part = part.get();
		}
		
		if (typeof part === "function") {
			value = part(value);
		} else {
			value = part;
		}
	}
	
	return value;
}

function getData(key, init) {
	var windowService = inject(WindowService);
	
	if (!windowService.data) {
		windowService.data = {};
	}
	
	if (windowService.data[key]) {
		return windowService.data[key];
	}
	
	return (
		windowService.data[key] = windowService.context(function() {
			var parts = createSignal([]);
			var initialValue;
			var callEffect = noop;
			
			init(windowService.window, function(value, effect) {
				initialValue = value;
				callEffect = effect;
			});
			
			var signal = parts.map(function(parts) {
				return getValue(parts, initialValue);
			});
			
			signal.effect(callEffect);
			
			return {
				parts: parts,
				signal: signal
			};
		})
	);
}

function createWindowData(key, init) {
	return function(part) {
		var data = getData(key, init);
		
		if (part === undefined) {
			return data.signal;
		}
		
		var parts = data.parts;
		
		if (part && typeof part.subscribe === "function") {
			part.subscribe(data.signal.invalidate);
		}
		
		parts.set(parts.get().concat([part]));
		
		onUnmount(function() {
			var ps = parts.get();
			
			for (var i = ps.length; i--;) {
				if (ps[i] === part) {
					parts.set(
						ps.slice(0, i).concat(
							ps.slice(i + 1)
						)
					);
					break;
				}
			}
		});
	};
}

$.windowData = createWindowData;

})($);
