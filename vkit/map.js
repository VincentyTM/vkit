(function($){

var createComputedSignal = $.computed;

function map(transform){
	function getComputed(){
		return createComputedSignal(transform, arguments);
	}
	
	getComputed.get = transform;
	
	return getComputed;
}

function mapThis(transform){
	return createComputedSignal(transform, this);
}

$.map = map;
$.fn.map = mapThis;

})($);
