(function($, undefined){

var xmlns = "http://www.w3.org/2000/svg";

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
			$.on(attr.substring(2), val)(el);
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

$.svgTag = function(tagName){
	return function(){
		var el = document.createElementNS(xmlns, tagName);
		$.append(el, arguments, setAttrs);
		return el;
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
