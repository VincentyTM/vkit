(function($){

var combineStates = $.fn.map;

function mapStates(transform){
	function map(){
		return combineStates.call(arguments, transform);
	}
	
	map.get = transform;
	
	return map;
}

$.map = mapStates;

})($);
