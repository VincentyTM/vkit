(function($) {

var queryParamsState = $.queryParamsState;

function param(name, win) {
	return queryParamsState(win)(name);
}

$.param = param;

})($);
