(function($, window, undefined){

var url = $.url;
var createState = $.state;
var createQueryParams = $.queryParams;
var createHistoryState = $.historyState;

function createQueryParamsState(win){
	if(!win) win = window;
	var historyURL = createHistoryState(win).url;
	var queryParamsState = url(historyURL).queryParams;
	return function(name){
		var state = createState();
		var set = state.set;
		queryParamsState.effect(function(queryParams){
			set( queryParams.get(name) );
		});
		state.set = function(value){
			set(value);
			var queryParams = createQueryParams(win.location.search.substring(1));
			if( value === null || value === undefined ){
				queryParams.del(name);
			}else{
				queryParams.set(name, value);
			}
			historyURL.set("?" + queryParams);
		};
		return state;
	};
};

$.queryParamsState = createQueryParamsState;

})($, window);
