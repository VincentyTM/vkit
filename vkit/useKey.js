(function($) {

var computed = $.computed;

function getKeys(result) {
	return result.keys;
}

function getRecords(result) {
	return result.records;
}

function useKey(arraySignal, getKey, transformValue) {
	var isFunction = typeof getKey === "function";
	
	var signal = arraySignal.map(function(array) {
		var records = {};
		var n = array ? array.length : 0;
		var keys = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var value = array[i];
			var key = isFunction ? getKey(value) : value[getKey];
			
			if (key in records) {
				throw new TypeError("Key '" + key + "' is not unique");
			}
			
			records[key] = value;
			keys[i] = key;
		}
		
		return {
			keys: keys,
			records: records
		};
	});
	
	var keysSignal = signal.map(getKeys);
	
	function select(key) {
		var selected = computed(function() {
			var k = key && typeof key.get === "function" ? key.get() : key;
			return signal.get().records[k];
		});
		
		if (key && typeof key.subscribe === "function") {
			key.subscribe(selected.invalidate);
		}
		
		signal.subscribe(selected.invalidate);
		selected.key = key;
		
		if (typeof transformValue === "function") {
			selected = transformValue(selected);
		}
		
		return selected;
	}
	
	function views(getView) {
		return keysSignal.views(function(key) {
			return getView(select(key));
		});
	}
	
	function getItem(key) {
		return signal.get().records[key];
	}
	
	return {
		array: arraySignal,
		getItem: getItem,
		records: signal.map(getRecords),
		select: select,
		views: views
	};
}

$.useKey = useKey;

})($);
