(function($, d){

var render = $.render;
var createObservable = $.observable;
var getCurrentScript = $.currentScript;

function respond(response){
	getCurrentScript().request.resolve(response);
}

function createScript(url, options){
	if(!url) return getCurrentScript().request;
	if(!options) options = {};
	
	var onLoad = createObservable();
	var onError = createObservable();
	var t = d.getElementsByTagName("script")[0];
	var p = t.parentNode;
	var s = d.createElement("script");
	
	function reset(){
		s.onload = s.onerror = s.onreadystatechange = null;
		s.request = null;
		p.removeChild(s);
	}
	
	function reject(error){
		reset();
		onError(error);
		render();
	}
	
	function resolve(data){
		reset();
		onLoad(data);
		render();
	}
	
	function onLoad(){
		var r = s.readyState;
		if(!r || r === "loaded" || r === "complete"){
			reset();
			onLoad();
			render();
		}
	}
	
	function then(loadHandler, errorHandler){
		if( typeof loadHandler === "function" ) onLoad.subscribe(loadHandler);
		if( typeof errorHandler === "function" ) onError.subscribe(errorHandler);
	}
	
	s.request = {
		"url": url,
		"data": options.data,
		"reject": reject,
		"resolve": resolve
	};
	
	if( options.referrerPolicy) s.referrerPolicy = options.referrerPolicy;
	if( options.crossOrigin ) s.crossOrigin = options.crossOrigin;
	if( options.integrity ) s.integrity = options.integrity;
	if( options.nonce ) s.nonce = options.nonce;
	
	s.onerror = reject;
	"onload" in s ? (s.onload = onLoad) : (s.onreadystatechange = onLoad);
	
	s.type = "text/javascript";
	s.async = true;
	s.src = url;
	
	p.insertBefore(s,t);
	
	return {
		then: then
	};
}

$.respond = respond;
$.script = createScript;

})($, document);
