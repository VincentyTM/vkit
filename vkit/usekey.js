(function($){

var createState = $.state;

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
	
	function select(key){
		var state = key.map ? $(recordsState, key).map(function(records, key){
			return records[key];
		}) : recordsState.map(function(records){
			return records[key];
		});
		if( typeof arrayState.item === "function" ){
			arrayState.item(state);
		}
		state.key = key;
		return state;
	}
	
	function getStateViews(getView){
		return keysState.views(function(key){
			return getView(select(key));
		});
	}
	
	return {
		select: select,
		views: getStateViews
	};
}

$.useKey = useKey;

})($);
