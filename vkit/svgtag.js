(function($, undefined){

var on = $.on;
var setStyle = $.style;
var addEffect = $.effect;
var append = $.append;
var xmlns = "http://www.w3.org/2000/svg";

function setAttr(el, attr, val){
	if( typeof val === "function" ){
		addEffect(function(){
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
			on(attr.substring(2), val)(el);
		}else if( attr === "style" ){
			for(var cssProp in val){
				var cssVal = val[cssProp];
				if( typeof cssVal === "function" ){
					setStyle(cssProp, cssVal)(el);
				}else if( cssVal && cssVal.style ){
					cssVal.style(cssProp)(el);
				}else{
					el.style[cssProp] = cssVal;
				}
			}
		}else{
			setAttr(el, attr, val);
		}
	}
}

function createSVGTag(tagName){
	return function(){
		var el = document.createElementNS(xmlns, tagName);
		append(el, arguments, el, setAttrs);
		return el;
	};
}

$.svgTag = createSVGTag;

if( typeof Proxy === "function" ){
	$.svgTags = new Proxy({}, {
		get: function(target, prop, receiver){
			return createSVGTag(prop.toLowerCase().replace(/_/g, "-"));
		}
	});
}

})($);
