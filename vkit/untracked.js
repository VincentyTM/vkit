(function($) {

var getComponent = $.getComponent;
var setComponent = $.setComponent;

function untracked(callback) {
	return function() {
		var component = getComponent(true);
		
		if (!component) {
			return callback();
		}
		
		try {
			setComponent(null);
			return callback();
		} finally {
			setComponent(component);
		}
	};
}

$.untracked = untracked;

})($);
