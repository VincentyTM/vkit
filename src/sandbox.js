(function($){

$.fn.sandbox=function(){
	var iframes=this;
	var source="";
	this.on("load", function(){
		this.loaded=true;
		var doc=this.contentWindow.document;
		doc.body.innerHTML=source;
		var scripts=doc.getElementsByTagName("script");
		for(var i=0, l=scripts.length, script, parent, next, ns; i<l; ++i){
			script=scripts[i];
			ns=doc.createElement("script");
			if( script.type ){
				ns.type=script.type;
			}
			if( script.src ){
				ns.src=script.src;
			}else if( script.text ){
				ns.text=script.text;
			}
			next=script.nextSibling;
			parent=script.parentNode;
			parent.removeChild(script);
			parent.insertBefore(ns, next);
		}
	});
	return {
		html: function(src){
			source=src;
			iframes.extend({
				"loaded": false,
				"src": ""
			});
			return this;
		},
		run: function(src){
			for(var i=0, l=iframes.length, iframe; i<l; ++i){
				iframe=iframes[i];
				if( iframe.loaded ){
					var doc=iframe.contentWindow.document;
					var script=doc.createElement("script");
					script.type="text/javascript";
					script.text=src;
					var head=doc.getElementsByTagName("head")[0];
					head.appendChild(script);
					head.removeChild(script);
				}
			}
			return this;
		},
		style: function(css){
			var selection=$(); selection.back=selection;
			for(var i=0, l=iframes.length, iframe, doc, head, style; i<l; ++i){
				iframe=iframes[i];
				if( iframe.loaded ){
					doc=iframe.contentWindow.document;
					head=doc.getElementsByTagName("head")[0];
					style=doc.createElement("style");
					style.type="text/css";
					head.appendChild(style);
					selection.push(style);
					if( style.styleSheet ){
						style.styleSheet.cssText=css;
					}else{
						style.appendChild( document.createTextNode(css) );
					}
				}
			}
			return selection;
		}
	};
};


$.fn.sandboxHTML=function(html){
	var src="data:text/html;charset=UTF-8," + encodeURIComponent('<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>' + html + '</body></html>');
	for(var i=0, l=this.length; i<l; ++i){
		this[i].src=src;
	}
	return this;
};

})($);
