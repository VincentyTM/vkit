var computed = require("./computed");
var returnNull = require("./returnNull");

function returnComputedNull() {
	return computed(returnNull);
}

module.exports = returnComputedNull;
