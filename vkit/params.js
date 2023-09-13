(function($) {

var queryParamsState = $.queryParamsState;

function params(win) {
	var qps = queryParamsState(win);
	
	return new Proxy({}, {
		get: function(target, name, receiver) {
			return qps(name);
		}
	});
}

$.params = params;

})($);
