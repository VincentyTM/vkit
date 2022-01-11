(function($, window, undefined){

var unmount = $.unmount;
var onEvent = $.onEvent;
var createState = $.state;
var syncState = $.sync;

function getValue(win){
	return {
		url: withoutOrigin(win, win.location.href),
		state: win.history.state
	};
}

function withoutOrigin(win, url){
	return decodeURIComponent(url.replace(win.location.origin, ""));
}

function getURL(value){
	return value.url;
}

function getState(value){
	return value.state;
}

function createHistoryState(win){
	if(!win) win = window;
	var entry = createState(getValue(win));

	entry.url = syncState(
		entry,
		getURL,
		function(url){
			setByEvent = false;
			var oldValue = entry.get();
			return {
				url: withoutOrigin(win, url),
				state: null
			};
		}
	);

	entry.state = syncState(
		entry,
		getState,
		function(url){
			setByEvent = false;
			var oldValue = entry.get();
			return {
				url: oldValue.url,
				state: state
			};
		}
	);

	var set = entry.set;
	var setByEvent = false;

	entry.set = function(value){
		if( typeof value !== "object" ){
			throw new TypeError("History state must be an object");
		}
		var oldValue = entry.get();
		set({
			url: value !== undefined ? withoutOrigin(win, value.url) : oldValue.url,
			state: value !== undefined ? value.state : null
		});
		setByEvent = false;
	};

	function onPopState(){
		set(getValue(win));
		setByEvent = true;
	}

	function push(value){
		var oldValue = entry.get();
		win.history.pushState(
			value !== undefined ? value.state : null,
			"",
			value !== undefined ? value.url : oldValue.url
		);
		onPopState();
	}

	unmount( onEvent(win, "popstate", onPopState) );
	unmount(
		entry.onChange.subscribe(function(value){
			if(!setByEvent){
				win.history.replaceState(value.state, "", value.url);
			}
		})
	);

	entry.push = push;
	entry.url.push = function(url){
		push({url: url});
	};
	entry.state.push = function(state){
		push({state: state});
	};

	return entry;
}

$.historyState = createHistoryState;

})($, window);