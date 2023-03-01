(function($, window, undefined){

var url = $.url;
var createState = $.state;
var createQueryParams = $.queryParams;
var createHistoryHandler = $.history;

function createQueryParamsState(win){
	if(!win) win = window;
	var location = win.location;
	var historyHandler = createHistoryHandler(win);
	var queryParamsState = url(historyHandler.url()).queryParams;
	return function(name, allowObject){
		var mode = 0;
		var state = createState();
		var set = state.set;
		queryParamsState.effect(allowObject ? function(queryParams){
			mode = 0;
			set.call(state, queryParams.get(name));
		} : function(queryParams){
			mode = 0;
			set.call(state, queryParams.getAsString(name));
		});
		state.set = function(value){
			mode = 1;
			set.call(state, value);
		};
		state.push = function(value){
			mode = 2;
			set.call(state, value);
		};
		state.onChange.subscribe(function(value){
			if( mode === 1 ){
				historyHandler.replace(getQuery(value) + location.hash);
			}else if( mode === 2 ){
				historyHandler.push(getQuery(value) + location.hash);
			}
		});
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
