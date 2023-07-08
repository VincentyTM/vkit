(function($, d){

var createObservable = $.observable;
var getCurrentScript = $.currentScript;
var update = $.update;

function respond(response){
	getCurrentScript().request.resolve(response);
}

function createScript(url, options){
	if(!url) return getCurrentScript().request;
	if(!options) options = {};
	
	var onLoad = createObservable();
	var onError = createObservable();
	var t = d.getElementsByTagName("script")[0];
	var s = d.createElement("script");
	
	function reset(){
		s.onload = s.onerror = s.onreadystatechange = null;
		s.request = null;
		var p = s.parentNode;
		if( p ){
			p.removeChild(s);
		}
	}
	
	function reject(error){
		reset();
		onError(error);
		update();
	}
	
	function resolve(data){
		reset();
		onLoad(data);
		update();
	}
	
	function onLoad(){
		var r = s.readyState;
		if(!r || r === "loaded" || r === "complete"){
			reset();
			onLoad();
			update();
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
	
	if( t ){
		t.parentNode.insertBefore(s, t);
	}else{
		d.getElementsByTagName("head")[0].appendChild(s);
	}
	
	return {
		then: then
	};
}

$.respond = respond;
$.script = createScript;

})($, document);
