(function($){

var createState = $.state;
var http = $.http;
var unmount = $.unmount;

function createHttpState(urlState, options){
	if(!options) options = {};
	var state = createState(options.defaultValue);
	var request = null;
	
	function updateValue(res){
		if( res.status !== 200 ){
			if( options.onerror ){
				options.onerror(new Error("HTTP status code is " + res.status));
			}
			return;
		}
		state.set(res.body);
	}
	
	urlState.effect(function(url){
		if( request ){
			request.abort();
		}
		if( url ){
			request = http(url, options);
			request.then(updateValue, options.onerror);
		}else{
			request = null;
			state.set(options.defaultValue);
		}
	});
	
	unmount(function(){
		if( request ){
			request.abort();
		}
	});
	
	return state.map();
}

$.httpState = createHttpState;

})($);
