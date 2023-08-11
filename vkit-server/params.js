var queryParamsState = require("./queryParamsState");

function params(){
	var qps = queryParamsState();
	
	return new Proxy({}, {
		get: function(target, name, receiver){
			return qps(name);
		}
	});
}

module.exports = params;
