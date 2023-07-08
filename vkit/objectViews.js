(function($){

var getKeys = Object.keys || function(object){
	var keys = [];
	
	for(var key in object){
		keys.push(key);
	}
	
	return keys;
};

function objectViews(recordsState, getView, factory){
	return recordsState.map(getKeys).views(function(key){
		var itemState = typeof recordsState.select === "function"
			? recordsState.select(key, factory)
			: recordsState.map(
				function(records){ return records[key]; }
			);
		
		itemState.key = key;
		
		return getView(itemState);
	});
}

$.objectViews = objectViews;

})($);
