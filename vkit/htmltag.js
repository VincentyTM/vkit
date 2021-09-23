(function($, undefined){

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
					setProps(el, child);
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

function setProps(el, props){
	for(var prop in props){
		var val = props[prop];
		if( prop.indexOf("on") === 0 ){
			$.state.on(prop.substring(2), val)(el);
		}else if( prop === "style" ){
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
			if( typeof val === "function" ){
				$.prop(prop, val)(el);
			}else if( val && val.prop ){
				val.prop(prop)(el);
			}else{
				el[prop] = val;
			}
		}
	}
}

function createElement(tagName, content){
	var el = document.createElement(tagName);
	var n = content.length;
	for(var i=0; i<n; ++i){
		append(el, content[i]);
	}
	return el;
}

$.htmlTag = function(tagName){
	return function(){
		return createElement(tagName, arguments);
	};
};

if( typeof Proxy === "function" ){
	$.htmlTags = new Proxy({}, {
		get: function(target, prop, receiver){
			return $.htmlTag(prop.toLowerCase());
		}
	});
}

})($);
