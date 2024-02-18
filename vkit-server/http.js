var noop = require("./noop");
var readOnly = require("./readOnly");
var scope = require("./scope");

function createRequest(data) {
	if (!data) {
		data = {};
	}
	
	var request = {
		url: null,
		method: "GET",
		async: true,
		headers: {},
		responseType: "text",
		user: null,
		password: null,
		body: null,
		abortable: true
	};
	
	if (typeof data === "string") {
		request.url = data;
	} else if (data && typeof data === "object") {
		for (var key in data) {
			if (key in request) {
				request[key] = data[key];
			}
		}
	}
	
	return request;
}

function http(request, options) {
	var currentScope = scope.get();
	
	if (typeof request === "function") {
		request = request();
	}
	
	request = createRequest(request);
	
	if (options && typeof options === "object") {
		for (var key in options) {
			if (key in request) {
				request[key] = options[key];
			}
		}
	}
	
	var response = currentScope.transformRequest(request);
	var result = readOnly(response);
	result.then = noop;
	return result;
}

module.exports = http;
