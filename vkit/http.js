(function($){

var render = $.render;
var createState = $.state;
var createEmitter = $.emitter;

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
	var headers = options.headers;
	var http = createEmitter();
	http.status = 0;
	http.response = "";
	http.readyState = createState(0);
	http.progress = createState({loaded: 0, total: 0, lengthComputable: false});
	http.upload = {
		progress: createState({loaded: 0, total: 0, lengthComputable: false}),
		aborted: false,
		abort: function(){
			if( xhr.upload ){
				xhr.upload.abort();
			}
			http.upload.aborted = true;
		}
	};
	http.aborted = false;
	http.abort = function(){
		http.aborted = true;
		xhr.abort();
	};
	http.header = function(name){
		return xhr.getResponseHeader(name);
	};
	http.headers = function(){
		return xhr.getAllResponseHeaders();
	};
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(e){
		http.status = xhr.status;
		http.readyState.set(xhr.readyState);
		if( xhr.readyState === 4 || xhr.readyState === 0 ){
			xhr.status >= 200 ? http.emit(http.response = xhr.response) : http.throwError(e || window.event);
		}
		render();
	};
	xhr.onprogress = function(e){
		http.progress.set(e);
		render();
	};
	if( xhr.upload ){
		xhr.upload.onprogress = function(e){
			http.upload.progress.set(e);
			render();
		};
	}
	xhr.open(method, url, options.async, options.user, options.password);
	xhr.responseType = options.responseType;
	if( headers ){
		for(var name in headers){
			xhr.setRequestHeader(name, headers[name]);
		}
	}
	xhr.send(options.body);
	return http;
};

$.http = createRequest;
$.http.config = defaultConfig;

})($);
