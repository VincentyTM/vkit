(function($) {

var empty = $.empty;
var noop = $.noop;
var renderDetached = $.renderDetached;

function createRoot(container) {
	var unmount = noop;
	
	return {
		render: function(rootComponent) {
			unmount();
			empty(container);
			unmount = renderDetached(rootComponent, container);
		},

		unmount: function() {
			unmount();
			unmount = noop;
		}
	};
}

$.createRoot = createRoot;

})($);
