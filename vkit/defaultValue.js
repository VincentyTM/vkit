(function($, undefined){

var map = $.map;

function defaultValue(value, fallback){
	return value === null || value === undefined ? fallback : value;
}

$.defaultValue = map(defaultValue);

})($);
