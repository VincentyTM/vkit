(function($) {

var computed = $.computed;

function map(selector) {
	function getComputed() {
		return computed(selector, arguments);
	}
	
	getComputed.get = selector;
	return getComputed;
}

function mapThis(selector) {
	return computed(selector, this);
}

$.map = map;
$.fn.map = mapThis;

})($);
