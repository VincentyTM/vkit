(function($) {

var computed = $.computed;
var timeout = $.timeout;

function debounce(input, delay) {
	var output = computed(function() {
		return input.get();
	});
	
	var invalidate = output.invalidate;
	
	input.effect(function() {
		timeout(invalidate, delay);
	});
	
	return output;
}

$.debounce = debounce;

})($);
