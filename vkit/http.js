(function($, undefined) {

var computed = $.computed;
var isSignal = $.isSignal;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

var UNSENT = {
    ok: false,
    progress: null,
    unsent: true,
    uploadProgress: null
};

var INIITIAL_PROGRESS = {
    loaded: 0,
    total: 0,
    lengthComputable: false
};

function http(request) {
    var response = signal(UNSENT);
	
    function setRequest(req) {
        if (req === null) {
            response.set(UNSENT);
            return;
        }
		
        var progress = signal(INIITIAL_PROGRESS);
        var uploadProgress = signal(INIITIAL_PROGRESS);
		
        response.set({
            ok: false,
            progress: readOnly(progress),
            unsent: false,
            uploadProgress: readOnly(uploadProgress)
        });
		
        var xhr = new XMLHttpRequest();
		
        xhr.onprogress = function(event) {
            progress.set(event);
            update();
        };
		
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 || xhr.readyState === 0) {
                var status = xhr.status;
				
                response.set({
                    body: xhr.response !== undefined ? xhr.response : xhr.responseText,
                    ok: status >= 200 && status <= 299,
                    progress: null,
                    status: status,
                    unsent: false,
                    uploadProgress: null,
					
                    getAllResponseHeaders: function() {
                        return xhr.getAllResponseHeaders();
                    },
					
                    getResponseHeader: function(name) {
                        return xhr.getResponseHeader(name);
                    }
                });
				
                update();
            }
        };
		
        if (xhr.upload) {
            xhr.upload.onprogress = function(event) {
                uploadProgress.set(event);
                update();
            };
        }
		
        if (typeof req === "string") {
            xhr.open("GET", req, true);
            xhr.send();
        } else {
            xhr.open((req.method || "GET").toUpperCase(), req.url || "", req.async !== false, req.user, req.password);
			
            if (req.mimeType !== undefined && xhr.overrideMimeType) {
                xhr.overrideMimeType(req.mimeType);
            }
			
            xhr.responseType = req.responseType || "";
			
            if (req.withCredentials !== undefined) {
                xhr.withCredentials = req.withCredentials;
            }
			
            var headers = req.headers;
			
            if (headers) {
                for (var name in headers) {
                    xhr.setRequestHeader(name, headers[name]);
                }
            }
			
            xhr.send(req.body);
        }
		
        onUnmount(function() {
            xhr.onprogress = null;
            xhr.onreadystatechange = null;
			
            if (xhr.upload) {
                xhr.upload.onprogress = null;
            }
			
            xhr.abort();
        });
    }
	
    if (typeof request === "function") {
        (isSignal(request) ? request : computed(request)).effect(setRequest);
    } else {
        setRequest(request);
    }
	
    return readOnly(response);
}

$.http = http;

})($);
