(function($) {

var getWindow = $.getWindow;
var observable = $.observable;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var signal = $.signal;

var count = 0;
var countChange = observable();

function prevent(e) {
	if (e && e.preventDefault) {
		e.preventDefault();
	}
	return "";
}

function unsavedGuard(condition, win) {
	if(!win) win = getWindow();
	var unsubscribe = null;
	
	function add() {
		if (!unsubscribe) {
			unsubscribe = onEvent(win, "beforeunload", prevent);
			countChange(++count);
		}
	}
	
	function remove() {
		if (unsubscribe) {
			unsubscribe();
			unsubscribe = null;
			countChange(--count);
		}
	}
	
	function update(value) {
		value ? add() : remove();
	}
	
	if (typeof condition === "function") {
		(typeof condition.effect === "function"
			? condition.map(Boolean)
			: computed(function() {
				return !!condition();
			})
		).effect(update);
	} else {
		add();
	}
	
	onUnmount(remove);
	return condition;
}

function allSaved() {
	var saved = signal(count === 0);
	
	onUnmount(
		countChange.subscribe(function(c) {
			saved.set(c === 0);
		})
	);
	
	return saved.map();
}

allSaved.get = function() {
	return count === 0;
};

$.allSaved = allSaved;
$.unsavedGuard = unsavedGuard;

})($);
