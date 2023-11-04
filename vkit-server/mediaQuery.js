var computed = require("./computed");

function mediaQuery() {
	return computed(function() {
		return false;
	});
}

module.exports = mediaQuery;
