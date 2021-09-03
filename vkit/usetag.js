(function($, undefined){

function append(el, child){
	if( child === null || child === undefined ){
		return;
	}
	switch( typeof child ){
		case "object":
			if( child.nodeType ){
				el.appendChild(child);
			}else{
				var n = child.length;
				var a = $.fn.toArray.call(child);
				for(var i=0; i<n; ++i){
					append(el, a[i]);
				}
			}
			break;
		case "function":
			el.appendChild($.text(child));
			break;
		default:
			el.appendChild(document.createTextNode(child));
	}
}

function createElement(tagName, props, content){
	var el = document.createElement(tagName);
	for(var prop in props ){
		var val = props[prop];
		if( prop.indexOf("on") === 0 ){
			$.on(prop.substring(2), val)(el);
		}else if( prop === "style" ){
			for(var cssProp in val){
				var cssVal = val[cssProp];
				if( typeof cssVal === "function" ){
					$.css(cssProp, cssVal)(el);
				}else{
					el.style[cssProp] = cssVal;
				}
			}
		}else{
			if( typeof val === "function" ){
				$.prop(prop, val)(el);
			}else{
				el[prop] = val;
			}
		}
	}
	var n = content.length;
	for(var i=0; i<n; ++i){
		append(el, content[i]);
	}
	return el;
};

var selfClosing = /^input|img|br|hr|link|meta|embed|param|source|area|base|col|track|wbr|keygen|menuitem|command$/i;

$.useTag = function(tagName){
	if( selfClosing.test(tagName) ){
		return function(props){
			return createElement(tagName, props || {}, []);
		};
	}
	return function(){
		var args = arguments;
		var obj = args[0];
		if( typeof obj === "object" ){
			return function(){
				return createElement(tagName, obj, arguments);
			};
		}
		return createElement(tagName, {}, args);
	};
};

if( typeof Proxy === "function" ){
	$.tags = new Proxy({}, {
		get: function(target, prop, receiver){
			return $.useTag(prop);
		}
	});
}

})($);
