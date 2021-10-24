(function($){

$.hashState = function(){
	var state = $.state(decodeURIComponent(location.hash.substring(1)));
	$.unmount(
		state.onChange.subscribe(function(value){
			location.replace("#" + encodeURIComponent(value));
		})
	);
	$.unmount(
		$.onEvent(window, "hashchange", function(){
			state.set(decodeURIComponent(location.hash.substring(1)));
		})
	);
	return state;
};

})($);
