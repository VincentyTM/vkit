(function($, undefined){

var xmlns = "http://www.w3.org/2000/svg";

function append(el, child){
	if( child === null || child === undefined ){
		return;
	}
	switch( typeof child ){
		case "object":
			if( child.nodeType ){
				el.appendChild(child);
			}else if( typeof child.text === "function" ){
				el.appendChild(child.text());
			}else{
				var n = child.length;
				if( typeof n === "number" ){
					var a = $.fn.toArray.call(child);
					for(var i=0; i<n; ++i){
						append(el, a[i]);
					}
				}else{
					setAttrs(el, child);
				}
			}
			break;
		case "function":
			child(el);
			break;
		default:
			el.appendChild(document.createTextNode(child));
	}
}

function setAttr(el, attr, val){
	if( typeof val === "function" ){
		$.effect(function(){
			el.setAttributeNS(null, attr, val());
		});
	}else if( val && val.effect ){
		val.effect(function(value){
			el.setAttributeNS(null, attr, value);
		});
	}else{
		el.setAttributeNS(null, attr, val);
	}
}

function setAttrs(el, attrs){
	for(var attr in attrs){
		var val = attrs[attr];
		if( attr.indexOf("on") === 0 ){
			$.state.on(attr.substring(2), val)(el);
		}else if( attr === "style" ){
			for(var cssProp in val){
				var cssVal = val[cssProp];
				if( typeof cssVal === "function" ){
					$.css(cssProp, cssVal)(el);
				}else if( cssVal && cssVal.css ){
					cssVal.css(cssProp)(el);
				}else{
					el.style[cssProp] = cssVal;
				}
			}
		}else{
			setAttr(el, attr, val);
		}
	}
}

function createElement(tagName, content){
	var el = document.createElementNS(xmlns, tagName);
	var n = content.length;
	for(var i=0; i<n; ++i){
		append(el, content[i]);
	}
	return el;
};

$.svgTag = function(tagName){
	return function(){
		return createElement(tagName, arguments);
	};
};

if( typeof Proxy === "function" ){
	$.svgTags = new Proxy({}, {
		get: function(target, prop, receiver){
			return $.svgTag(prop.toLowerCase());
		}
	});
}

})($);
