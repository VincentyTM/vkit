(function($) {

var computed = $.computed;

function getSelf(value) {
	return value;
}

function readOnly(input) {
	return computed(getSelf, [input]);
}

$.readOnly = readOnly;

})($);
