(function($, undefined) {

var effect = $.effect;
var observable = $.observable;
var onUnmount = $.onUnmount;
var signal = $.signal;
var update = $.update;

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
		mimeType: undefined,
		withCredentials: undefined,
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

function sendRequest(request, pendingResponse, responseState, complete) {
	if (request.url === null || request.url === undefined) {
		return null;
	}
	
	var xhr = new XMLHttpRequest();
	
	xhr.onprogress = function(e) {
		pendingResponse.progress.set(e);
		update();
	};
	
	if (xhr.upload) {
		xhr.upload.onprogress = function(e) {
			pendingResponse.uploadProgress.set(e);
			update();
		};
	}
	
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4 || xhr.readyState === 0) {
			var response = createResponse(xhr);
			responseState.set(response);
			complete(response);
		}
		
		update();
	};
	
	xhr.open(
		request.method,
		request.url,
		request.async,
		request.user,
		request.password
	);
	
	if (request.mimeType !== undefined && xhr.overrideMimeType) {
		xhr.overrideMimeType(request.mimeType);
	}
	
	xhr.responseType = request.responseType;
	
	if (request.withCredentials !== undefined) {
		xhr.withCredentials = request.withCredentials;
	}
	
	var headers = request.headers;
	
	for (var name in headers) {
		xhr.setRequestHeader(name, headers[name]);
	}
	
	xhr.send(request.body);
	
	return xhr;
}

function createProgressEvent() {
	return {
		lengthComputable: false,
		loaded: 0,
		total: 0
	};
}

function createResponse(xhr) {
	function getHeader(name) {
		return xhr.getResponseHeader(name);
	}
	
	function getHeaders() {
		return xhr.getAllResponseHeaders();
	}
	
	var status = xhr.status;
	
	return {
		ok: status >= 200 && status <= 299,
		status: status,
		header: getHeader,
		headers: getHeaders,
		body: xhr.response !== undefined ? xhr.response : xhr.responseText
	};
}

function createPendingResponse(abort) {
	return {
		abort: abort,
		progress: signal(createProgressEvent()),
		uploadProgress: signal(createProgressEvent())
	};
}

function createResponseState(requestData, options, onAbort) {
	function abort() {
		if (xhr && isAbortable) {
			xhr.onreadystatechange = null;
			xhr.onprogress = null;
			
			if (xhr.upload) {
				xhr.upload.onprogress = null;
			}
			
			xhr.abort();
		}
		
		xhr = null;
		unsubscribe();
		unsubscribe.clear();
	}
	
	function setRequest(req) {
		abort();
		
		var request = createRequest(req);
		
		if (options && typeof options === "object") {
			for (var key in options) {
				if (key in request) {
					request[key] = options[key];
				}
			}
		}
		
		var method = request.method.toUpperCase();
		isAbortable = request.abortable;
		
		var pendingResponse = createPendingResponse(abort);
		xhr = sendRequest(request, pendingResponse, responseState, complete);
		responseState.set(xhr ? pendingResponse : {unsent: true});
		
		if (xhr) {
			unsubscribe.subscribe(onAbort.subscribe(abort));
		}
	}
	
	function complete(response) {
		onResponse(response);
		onResponse.clear();
		abort();
	}
	
	var onResponse = observable();
	var unsubscribe = observable();
	var xhr = null;
	var isAbortable = true;
	var responseState = signal();
	
	if (typeof requestData === "function") {
		if (typeof requestData.effect === "function") {
			requestData.effect(setRequest);
		} else {
			effect(function() {
				setRequest(requestData());
			});
		}
	} else {
		setRequest(requestData);
	}
	
	var result = responseState.map();
	result.then = onResponse.subscribe;
	return result;
}

function createHttpHandle(request, options) {
	var abort = observable();
	var hasAborter = options && typeof options.aborter === "function";
	
	if (hasAborter) {
		options.aborter(abort);
	} else {
		onUnmount(abort);
	}
	
	return createResponseState(request, options, abort);
}

$.http = createHttpHandle;

})($);
