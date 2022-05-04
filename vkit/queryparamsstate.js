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
	return function(name){
		var state = createState();
		var set = state.set;
		queryParamsState.effect(function(queryParams){
			set( queryParams.get(name) );
		});
		function setValue(value){
			set(value);
			var queryParams = createQueryParams(location.search.substring(1));
			if( value === null || value === undefined ){
				queryParams.del(name);
			}else{
				queryParams.set(name, value);
			}
			return queryParams;
		}
		state.set = function(value){
			historyURL.set("?" + setValue(value) + location.hash);
		};
		state.push = function(value){
			historyURL.push("?" + setValue(value) + location.hash);
		};
		return state;
	};
};

function param(name, win){
	return createQueryParamsState(win)(name);
}

$.queryParamsState = createQueryParamsState;
$.param = param;

})($, window);
