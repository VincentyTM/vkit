var computed = require("./computed");

function map(transform) {
	function getComputed() {
		return computed(transform, arguments);
	}
	
	getComputed.get = transform;
	
	return getComputed;
}

module.exports = map;
