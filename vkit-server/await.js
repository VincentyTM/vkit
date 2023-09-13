var readOnly = require("./readOnly");

function awaitPromise(promiseOrSignal) {
	var output = readOnly({pending: true});
	
	output.then = function(fulfilled, rejected, pending) {
		return output.view(function(data) {
			if (typeof pending === "function") {
				return pending();
			}
		});
	};
	
	return output;
}

module.exports = awaitPromise;
