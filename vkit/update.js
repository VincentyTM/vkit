(function($) {

var callTicks = $.callTicks;
var queueMicrotask = $.queueMicrotask;

var queue = [];

function enqueueUpdate(callback) {
	if (queue.push(callback) === 1) {
		queueMicrotask(update);
	}
}

function dequeueUpdate(callback) {
	for (var i = queue.length; i--;) {
		if (queue[i] === callback) {
			queue.splice(i, 1);
			break;
		}
	}
}

function update() {
	var n;
	
	while (n = queue.length) {
		var updates = queue;
		queue = [];
		
		for (var i = 0; i < n; ++i) {
			updates[i]();
		}
	}
	
	callTicks();
}

$.dequeueUpdate = dequeueUpdate;
$.enqueueUpdate = enqueueUpdate;
$.update = update;

})($);
