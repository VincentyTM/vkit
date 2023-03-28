(function($, undefined){

var createObservable = $.observable;
var createState = $.state;
var render = $.render;
var unmount = $.unmount;

function createRequest(data){
	if(!data) data = {};
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
	if( typeof data === "string" ){
		request.url = data;
	}else if( data && typeof data === "object" ){
		for(var key in data){
			if( key in request ){
				request[key] = data[key];
			}
		}
	}
	return request;
}

function sendRequest(request, pendingResponse, responseState, complete){
	if( request.url === null ){
		return null;
	}
	var xhr = new XMLHttpRequest();
	xhr.onprogress = function(e){
		pendingResponse.progress.set(e);
		render();
	};
	if( xhr.upload ){
		xhr.upload.onprogress = function(e){
			pendingResponse.uploadProgress.set(e);
			render();
		};
	}
	xhr.onreadystatechange = function(){
		if( xhr.readyState === 4 || xhr.readyState === 0 ){
			var response = createResponse(xhr);
			responseState.set(response);
			complete(response);
		}
		render();
	};
	xhr.open(request.method, request.url, request.async, request.user, request.password);
	xhr.responseType = request.responseType;
	var headers = request.headers;
	for(var name in headers){
		xhr.setRequestHeader(name, headers[name]);
	}
	xhr.send(request.body);
	return xhr;
}

function createProgressEvent(){
	return {
		lengthComputable: false,
		loaded: 0,
		total: 0
	};
}

function createResponse(xhr){
	function getHeader(name){
		return xhr.getResponseHeader(name);
	}
	
	function getHeaders(){
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

function createPendingResponse(abort){
	return {
		abort: abort,
		progress: createState(createProgressEvent()),
		uploadProgress: createState(createProgressEvent())
	};
}

function createResponseState(requestState, options, onAbort){
	function abort(){
		if( xhr && isAbortable ){
			xhr.abort();
		}
		xhr = null;
		unsubscribe();
		unsubscribe.clear();
	}
	
	function setRequest(req){
		abort();
		var request = createRequest(req);
		if( options && typeof options === "object" ){
			for(var key in options){
				if( key in request ){
					request[key] = options[key];
				}
			}
		}
		var method = request.method.toUpperCase();
		isAbortable = request.abortable;
		var pendingResponse = createPendingResponse(abort);
		xhr = sendRequest(request, pendingResponse, responseState, complete);
		responseState.set(xhr ? pendingResponse : {unsent: true});
		if( xhr ){
			unsubscribe.subscribe(onAbort.subscribe(abort));
		}
	}
	
	function complete(response){
		onResponse(response);
		onResponse.clear();
		abort();
	}
	
	var onResponse = createObservable();
	var unsubscribe = createObservable();
	var xhr = null;
	var isAbortable = true;
	var responseState = createState();
	if( requestState && typeof requestState.effect === "function" ){
		requestState.effect(setRequest);
	}else{
		setRequest(requestState);
	}
	
	var result = responseState.map();
	result.then = onResponse.subscribe;
	return result;
}

function createHttpHandle(request, options){
	var abort = createObservable();
	var hasAborter = options && typeof options.aborter === "function";
	if( hasAborter ){
		options.aborter(abort);
	}else{
		unmount(abort);
	}
	return createResponseState(request, options, abort);
}

function createAborter(){
	var cb = null;
	unmount(function(){
		if( typeof cb === "function" ){
			cb();
		}
	});
	return function(callback){
		if( typeof cb === "function" ){
			cb();
		}
		cb = callback;
	};
}

$.http = createHttpHandle;
$.aborter = createAborter;

})($);
