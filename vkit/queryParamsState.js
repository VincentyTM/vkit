(function($) {

var getWindow = $.getWindow;
var history = $.history;
var parseURL = $.parseURL;
var queryParams = $.queryParams;

function createQueryParamsState(win) {
	if (!win) {
		win = getWindow();
	}
	
	var location = win.location;
	var historyHandler = history(win);
	var queryParamsState = parseURL(historyHandler.url()).queryParams;
	
	return function(name, allowObject) {
		var state = queryParamsState.map(allowObject
			? function(qp) { return qp.get(name); }
			: function(qp) { return qp.getAsString(name); }
		);
		
		state.replace = function(value) {
			historyHandler.replace(getQuery(value) + location.hash);
		};
		
		state.push = function(value) {
			historyHandler.push(getQuery(value) + location.hash);
		};
		
		function getQuery(value) {
			var qp = queryParams(location.search.substring(1));
			qp.set(name, value);
			var params = qp.toString();
			return params ? "?" + params : location.pathname;
		}
		
		return state;
	};
};

$.queryParamsState = createQueryParamsState;

})($);
