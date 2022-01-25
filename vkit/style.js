(function($){

var unmount = $.unmount;
var afterRender = $.afterRender;
var styleCount = 0;

function addStyle(docs, document, css, selector){
	function replace(css){
		return css.replace(/::?this\b/ig, selector);
	}
	for(var i=docs.length; i--;){
		if( docs[i].document === document ){
			++docs[i].count;
			return;
		}
	}
	var head = document.getElementsByTagName("head")[0];
	var style = document.createElement("style");
	style.appendChild(typeof css.map === "function"
		? css.map(replace).text()
		: document.createTextNode(replace(css))
	);
	head.appendChild(style);
	docs.push({
		document: document,
		style: style,
		count: 1
	});
}

function removeStyle(docs, document){
	for(var i=docs.length; i--;){
		if( docs[i].document === document ){
			if( --docs[i].count === 0 ){
				var style = docs.splice(i, 1)[0].style;
				if( style.parentNode ){
					style.parentNode.removeChild(style);
				}
			}
			return;
		}
	}
}

function componentStyle(css){
	var attr = "vkit-component" + (++styleCount);
	var selector = "[" + attr + "]";
	var docs = [];
	return function(el){
		var document = el.ownerDocument;
		unmount(function(){
			removeStyle(docs, document);
		});
		afterRender(function(){
			document = el.ownerDocument;
			addStyle(docs, document, css, selector);
			el.setAttribute(attr, "true");
		});
	};
}

$.style = componentStyle;

})($);
