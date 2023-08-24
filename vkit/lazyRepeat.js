(function($){

var createSignal = $.signal;
var lazyArray = $.lazyArray;
var range = $.range;

function lazyRepeat(count, getView){
	return lazyArray(count && typeof count.map === "function"
		? count.map(range)
		: createSignal(range)
	).views(getView);
}

$.lazyRepeat = lazyRepeat;

})($);
