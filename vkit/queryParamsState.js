(function($, undefined){

var url = $.url;
var createHistoryHandler = $.history;
var createQueryParams = $.queryParams;
var createState = $.state;
var getWindow = $.window;

function createQueryParamsState(win){
	if(!win){
		win = getWindow();
	}
	
	var location = win.location;
	var historyHandler = createHistoryHandler(win);
	var queryParamsState = url(historyHandler.url()).queryParams;
	
	return function(name, allowObject){
		var state = queryParamsState.map(allowObject
			? function(queryParams){ return queryParams.get(name); }
			: function(queryParams){ return queryParams.getAsString(name); }
		);
		
		state.replace = function(value){
			historyHandler.replace(getQuery(value) + location.hash);
		};
		
		state.push = function(value){
			historyHandler.push(getQuery(value) + location.hash);
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

function params(win){
	var qps = createQueryParamsState(win);
	
	if( typeof Proxy === "function" ){
		return new Proxy({}, {
			get: function(target, name, receiver){
				return qps(name);
			}
		});
	}
}

$.param = param;
$.params = params;
$.queryParamsState = createQueryParamsState;

})($);
