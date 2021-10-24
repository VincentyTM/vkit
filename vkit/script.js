(function($){

function Async(fn){
	var nexts = [];
	var fails = [];
	this.then = function(next, fail){
		if( next ) nexts.push(next);
		if( fail ) fails.push(fail);
	};
	fn(function(){
		for(var i=0; i<nexts.length; ++i){
			nexts[i].apply(null, arguments);
		}
	}, function(){
		for(var i=0; i<fails.length; ++i){
			fails[i].apply(null, arguments);
		}
	});
}

$.exports=function(response){
	$.currentScript().request.resolve(response);
};

$.script=function(url, options){
	if(!url)
		return $.currentScript().request;
	if(!options)
		options = {};
	var data = options.data;
	return new Async(function(resolve, reject){
		var res=false;
		var req={
			"url": url,
			"data": data,
			"reject": function(data){ reject(data); res=true; },
			"resolve": function(data){ resolve(data); res=true; }
		};
		var d=document;
		var t=d.getElementsByTagName("script")[0];
		var p=t.parentNode;
		var s=d.createElement("script");
		var f=true;
		function m(){ s.onload=s.onreadystatechange=null; s.request=null; p.removeChild(s); }
		s["onload" in s?"onload":"onreadystatechange"]=function(){
			var r=s.readyState;
			if( f&&(!r||r=="loaded"||r=="complete") ){
				f=false; m(); !res && resolve();
			}
		};
		s.onerror=function(error){ m(); reject(error); };
		s.request=req;
		s.type="text/javascript";
		s.async=true;
		if( options.crossOrigin ) s.crossOrigin = options.crossOrigin;
		if( options.integrity ) s.integrity = options.integrity;
		s.src=url;
		p.insertBefore(s,t);
	});
};

})($);