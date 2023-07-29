var createConstantSignal = require("./constant");

function awaitPromise(promiseOrSignal){
	var output = createConstantSignal({pending: true});
	
	output.then = function(fulfilled, rejected, pending){
		return output.view(function(data){
			if( typeof pending === "function" ){
				return pending();
			}
		});
	};
	
	return output;
}

module.exports = awaitPromise;
