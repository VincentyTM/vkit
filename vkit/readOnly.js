(function($) {

var computed = $.computed;

function getSelf(value) {
	return value;
}

function readOnly(signalOrValue){
	return computed(getSelf, [signalOrValue]);
}

$.readOnly = readOnly;

})($);
