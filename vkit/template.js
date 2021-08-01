(function($){

$.template = function(string, map){
	if(!map){
		return $.html(string);
	}
	
	var n = string.length;
	var pos = 0;
	var array = [];
	
	while( pos < n ){
		var minIndex = n;
		var minLength = 0;
		var minValue = null;
		for(var key in map){
			var index = string.indexOf(key, pos);
			if( index >= 0 && index < minIndex ){
				minIndex = index;
				minLength = key.length;
				minValue = typeof map[key] === "function" ? map[key]() : map[key];
			}
		}
		if( minIndex > pos ){
			array.push( string.substring(pos, minIndex) );
		}
		if( minIndex < n ){
			array.push(minValue);
		}
		pos = minIndex + minLength;
	}
	
	return $.html.apply(null, array);
};

})($);
