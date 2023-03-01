(function($, window, undefined){

var createObservable = $.observable;
var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;
var onStateUpdate = createObservable();

function getURL(win){
	return win.location.href.replace(win.location.origin, "");
}

function createHistoryHandler(win){
	if(!win) win = window;
	var history = win.history;
	
	function push(url, state){
		history.pushState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		onStateUpdate(history);
	}
	
	function replace(url, state){
		history.replaceState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		onStateUpdate(history);
	}
	
	function selectState(){
		var state = createState(history.state);
		unmount(
			onEvent(win, "popstate", function(){
				state.set(history.state);
			})
		);
		unmount(
			onStateUpdate.subscribe(function(h){
				if( h === history ){
					state.set(history.state);
				}
			})
		);
		return state.map();
	}
	
	function selectURL(){
		var state = createState(getURL(win));
		unmount(
			onEvent(win, "popstate", function(){
				state.set(getURL(win));
			})
		);
		unmount(
			onStateUpdate.subscribe(function(h){
				if( h === history ){
					state.set(getURL(win));
				}
			})
		);
		return state.map();
	}
	
	return {
		push: push,
		replace: replace,
		state: selectState,
		url: selectURL
	};
}

$.history = createHistoryHandler;

})($, window);
