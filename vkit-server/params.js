import queryParamsState from "./queryParamsState.js";

export default function params() {
	var qps = queryParamsState();
	
	return new Proxy({}, {
		get: function(target, name, receiver) {
			return qps(name);
		}
	});
}
