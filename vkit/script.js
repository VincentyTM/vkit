(function($, d){

function exportData(response){
	$.currentScript().request.resolve(response);
}

function createScript(url, options){
	if(!url) return $.currentScript().request;
	if(!options) options = {};
	
	var emitter = $.emitter();
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
		emitter.throwError(error);
	}
	
	function resolve(data){
		reset();
		emitter.emit(data);
	}
	
	function onLoad(){
		var r = s.readyState;
		if(!r || r === "loaded" || r === "complete"){
			reset();
			emitter.emit();
		}
	}
	
	s.request = {
		"url": url,
		"data": options.data,
		"reject": reject,
		"resolve": resolve
	};
	
	if( options.crossOrigin ) s.crossOrigin = options.crossOrigin;
	if( options.integrity ) s.integrity = options.integrity;
	
	s.onerror = reject;
	"onload" in s ? (s.onload = onLoad) : (s.onreadystatechange = onLoad);
	
	s.type = "text/javascript";
	s.async = true;
	s.src = url;
	
	p.insertBefore(s,t);
	
	return emitter;
}

$.exports = exportData;
$.script = createScript;

})($, document);
