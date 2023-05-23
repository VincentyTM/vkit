(function($){

var createState = $.state;
var map = $.fn.map;

function useKey(arrayState, getKey){
	var isFunction = typeof getKey === "function";
	var recordsState = createState({});
	var keysState = arrayState.map(function(array){
		var records = {};
		var n = array ? array.length : 0;
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
	
	function select(key, factory){
		var state = key.map ? map.call([recordsState, key], function(records, key){
			return records[key];
		}) : recordsState.map(function(records){
			return records[key];
		});
		if( typeof arrayState.item === "function" ){
			arrayState.item(state, factory);
		}
		state.key = key;
		return state;
	}
	
	function getStateViews(getView, factory){
		return keysState.views(function(key){
			return getView(select(key, factory));
		});
	}
	
	function getItem(key){
		return recordsState.get()[key];
	}
	
	return {
		select: select,
		views: getStateViews,
		records: recordsState,
		getItem: getItem
	};
}

$.useKey = useKey;

})($);
