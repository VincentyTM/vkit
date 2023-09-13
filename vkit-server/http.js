var noop = require("./noop");
var readOnly = require("./readOnly");

function createHttpHandle(request, options) {
	var result = readOnly({unsent: true});
	result.then = noop;
	return result;
}

module.exports = createHttpHandle;
