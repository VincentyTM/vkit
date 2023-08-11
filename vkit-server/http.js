var createConstantSignal = require("./constant");
var noop = require("./noop");

function createHttpHandle(request, options){
	var result = createConstantSignal({unsent: true});
	
	result.then = noop;
	
	return result;
}

module.exports = createHttpHandle;
