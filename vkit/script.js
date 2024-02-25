(function($) {

var currentScript = $.currentScript;
var getWindow = $.getWindow;
var promise = $.promise;
var update = $.update;

function respond(response) {
	currentScript().request.resolve(response);
}

function createScript(url, options) {
	if (!url) {
		return currentScript().request;
	}
	
	if (!options) {
		options = {};
	}
	
	var d = options.document || getWindow().document;
	
	return promise(function(resolve, reject) {
		var t = d.getElementsByTagName("script")[0];
		var s = d.createElement("script");
		
		function reset() {
			s.onload = s.onerror = s.onreadystatechange = null;
			s.request = null;
			
			var p = s.parentNode;
			
			if (p) {
				p.removeChild(s);
			}
		}
		
		function fail(error) {
			reset();
			reject(error);
			update();
		}
		
		function done(data) {
			reset();
			resolve(data);
			update();
		}
		
		function loadHandler() {
			var r = s.readyState;
			
			if (!r || r === "loaded" || r === "complete") {
				done();
			}
		}
		
		s.request = {
			"url": url,
			"data": options.data,
			"reject": fail,
			"resolve": done
		};
		
		if (options.referrerPolicy) s.referrerPolicy = options.referrerPolicy;
		if (options.crossOrigin) s.crossOrigin = options.crossOrigin;
		if (options.integrity) s.integrity = options.integrity;
		if (options.nonce) s.nonce = options.nonce;
		
		s.onerror = reject;
		
		if ("onload" in s) {
			s.onload = loadHandler;
		} else {
			s.onreadystatechange = loadHandler;
		}
		
		s.type = "text/javascript";
		s.async = true;
		s.src = url;
		
		if (t) {
			t.parentNode.insertBefore(s, t);
		} else {
			(d.head || d.getElementsByTagName("head")[0]).appendChild(s);
		}
	});
}

$.respond = respond;
$.script = createScript;

})($);
