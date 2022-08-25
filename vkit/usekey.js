(function($){

var createState = $.state;

function useKey(arrayState, getKey){
	var isFunction = typeof getKey === "function";
	var recordsState = createState({});
	var keysState = arrayState.map(function(array){
		var records = {};
		var n = array.length;
		var keys = new Array(n);
		for(var i=0; i<n; ++i){
			var value = array[i];
			var key = isFunction ? getKey(value) : value[getKey];
			if( key in records ){
				throw new TypeError("Key '" + key + "' is not unique");
			}
			records[key] = value;
			keys[i] = key;
		}
		recordsState.set(records);
		return keys;
	});
	
	function getStateViews(getView){
		return keysState.views(function(key){
			return getView(recordsState.map(function(records){
				return records[key];
			}));
		});
	}
	
	return {
		views: getStateViews
	};
}

$.useKey = useKey;

})($);
