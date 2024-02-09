(function($, g){

var callTicks = $.callTicks;
var queue = [];

var queueMicrotask = g.queueMicrotask || (typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback){ Promise.resolve().then(callback); }
	: function(callback){ setTimeout(callback, 0); });

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

})($, this);
