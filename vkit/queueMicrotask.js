(function($, g) {

$.queueMicrotask = g.queueMicrotask || (
	typeof Promise === "function" && typeof Promise.resolve === "function"
		? function(callback) { Promise.resolve().then(callback); }
		: function(callback) { setTimeout(callback, 0); }
);

})($, this);
