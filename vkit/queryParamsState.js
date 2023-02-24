(function($, window, undefined){

var url = $.url;
var createState = $.state;
var createQueryParams = $.queryParams;
var createHistoryState = $.historyState;

function createQueryParamsState(win){
	if(!win) win = window;
	var location = win.location;
	var historyURL = createHistoryState(win).url;
	var queryParamsState = url(historyURL).queryParams;
	return function(name, allowObject){
		var state = queryParamsState.map(allowObject ? function(queryParams){
			return queryParams.get(name);
		} : function(queryParams){
			return queryParams.getAsString(name);
		});
		state.set = function(value){
			historyURL.set(getQuery(value) + location.hash);
		};
		state.push = function(value){
			historyURL.push(getQuery(value) + location.hash);
		};
		function getQuery(value){
			var queryParams = createQueryParams(location.search.substring(1));
			queryParams.set(name, value);
			var params = queryParams.toString();
			return params ? "?" + params : location.pathname;
		}
		return state;
	};
};

function param(name, win){
	return createQueryParamsState(win)(name);
}

$.queryParamsState = createQueryParamsState;
$.param = param;

})($, window);
