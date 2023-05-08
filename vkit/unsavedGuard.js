(function($, window){

var unmount = $.unmount;
var createObservable = $.observable;
var createState = $.state;
var onEvent = $.onEvent;

var count = 0;
var countChange = createObservable();

function prevent(e){
	if( e && e.preventDefault ){
		e.preventDefault();
	}
	return "";
}

function unsavedGuard(state, win){
	if(!win) win = window;
	var unsubscribe = null;
	
	function add(){
		if(!unsubscribe){
			unsubscribe = onEvent(win, "beforeunload", prevent);
			countChange(++count);
		}
	}
	
	function remove(){
		if( unsubscribe ){
			unsubscribe();
			unsubscribe = null;
			countChange(--count);
		}
	}
	
	function update(value){
		value ? add() : remove();
	}
	
	state && state.map ? state.map(Boolean).effect(update) : add();
	unmount(remove);
	return state;
}

function allSaved(){
	var saved = createState(count === 0);
	
	unmount(
		countChange.subscribe(function(c){
			saved.set(c === 0);
		})
	);
	
	return saved.map();
}

allSaved.get = function(){
	return count === 0;
};

$.allSaved = allSaved;
$.unsavedGuard = unsavedGuard;

})($, window);
