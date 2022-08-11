(function($){

var render = $.render;
var createState = $.state;
var createObservable = $.observable;

var defaultConfig = {
	async: true,
	headers: {},
	responseType: "text",
	user: null,
	password: null,
	body: null
};

function createRequest(url, options){
	if( options ){
		return sendXHR(options.method, url, options);
	}
	return {
		get: function(options){
			return sendXHR("GET", url, options);
		},
		put: function(options){
			return sendXHR("PUT", url, options);
		},
		del: function(options){
			return sendXHR("DELETE", url, options);
		},
		post: function(options){
			return sendXHR("POST", url, options);
		},
		patch: function(options){
			return sendXHR("PATCH", url, options);
		}
	};
}

function getConfig(options){
	if(!options){
		return defaultConfig;
	}
	var config = {};
	for(var key in defaultConfig){
		config[key] = key in options ? options[key] : defaultConfig[key];
	}
	return config;
}

function sendXHR(method, url, options){
	options = getConfig(options);
	var onComplete = createObservable();
	var onError = createObservable();
	var progress = createState({
		total: 0,
		loaded: 0,
		lengthComputable: false
	});
	var uploadProgress = createState({
		total: 0,
		loaded: 0,
		lengthComputable: false
	});
	var readyState = createState(0);
	var abortHandler = options.onAbort;
	var http = {
		then: then,
		abort: abort,
		status: 0,
		header: getHeader,
		headers: getHeaders,
		progress: progress,
		uploadProgress: uploadProgress,
		readyState: readyState
	};
	var xhr = new XMLHttpRequest();
	xhr.onprogress = onProgress;
	if( xhr.upload ){
		xhr.upload.onprogress = onUploadProgress;
	}
	if( abortHandler ){
		xhr.onabort = onAbort;
	}
	xhr.onreadystatechange = onReadyStateChange;
	xhr.open(method, url, options.async, options.user, options.password);
	xhr.responseType = options.responseType;
	var headers = options.headers;
	if( headers ){
		for(var name in headers){
			xhr.setRequestHeader(name, headers[name]);
		}
	}
	xhr.send(options.body);
	return http;
	
	function abort(){
		xhr.abort();
	}
	
	function getHeader(name){
		return xhr.getResponseHeader(name);
	}
	
	function getHeaders(){
		return xhr.getAllResponseHeaders();
	}
	
	function then(resolve, reject){
		if( resolve ){
			onComplete.subscribe(resolve);
		}
		if( reject ){
			onError.subscribe(reject);
		}
	}
	
	function onProgress(e){
		progress.set(e);
		render();
	}
	
	function onUploadProgress(e){
		uploadProgress.set(e);
		render();
	}
	
	function onAbort(){
		abortHandler();
		render();
	}
	
	function onReadyStateChange(e){
		http.status = xhr.status;
		if( readyState ){
			readyState.set(xhr.readyState);
		}
		if( xhr.readyState === 4 || xhr.readyState === 0 ){
			var data = {
				status: xhr.status,
				header: getHeader,
				headers: getHeaders,
				body: typeof xhr.response !== "undefined" ? xhr.response : xhr.responseText
			};
			xhr.status >= 200 ? onComplete(data) : onError(data);
		}
		render();
	}
}

$.http = createRequest;
$.http.config = defaultConfig;

})($);
