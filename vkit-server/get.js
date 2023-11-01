var isSignal = require("./isSignal");

function get(signalOrValue){
	return isSignal(signalOrValue) ? signalOrValue.get() : signalOrValue;
}

module.exports = get;
