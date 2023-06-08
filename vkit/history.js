(function($, undefined){

var createObservable = $.observable;
var createState = $.state;
var getWindow = $.window;
var onEvent = $.onEvent;
var render = $.render;
var unmount = $.unmount;

var emitUpdate = createObservable();

function getURL(win){
	return win.location.href.replace(win.location.origin, "");
}

function createHistoryHandler(win){
	if(!win) win = getWindow();
	var history = win.history;
	
	function push(url, state){
		history.pushState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		emitUpdate(history);
	}
	
	function replace(url, state){
		history.replaceState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		emitUpdate(history);
	}
	
	function selectState(){
		var state = createState(history.state);
		unmount(
			onEvent(win, "popstate", function(){
				state.set(history.state);
			})
		);
		unmount(
			emitUpdate.subscribe(function(h){
				if( h === history ){
					state.set(history.state);
					render();
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
			emitUpdate.subscribe(function(h){
				if( h === history ){
					state.set(getURL(win));
					render();
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

})($);
