(function($) {

var computed = $.computed;

function is(condition) {
	return computed(function() {
		return !!condition();
	})();
}

$.is = is;

})($);
