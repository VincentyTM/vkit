(function($) {

var getKeys = Object.keys || function(object) {
	var keys = [];
	
	for (var key in object) {
		keys.push(key);
	}
	
	return keys;
};

function objectViews(records, getItemView, factory) {
	return records.map(getKeys).views(function(key) {
		var item = typeof records.select === "function"
			? records.select(key, factory)
			: records.map(function(records) {
				return records[key];
			});
		
		item.key = key;
		
		return getItemView(item);
	});
}

$.objectViews = objectViews;

})($);
