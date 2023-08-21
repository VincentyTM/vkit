(function($, document){

var on = $.on;
var bind = $.bind;
var addEffect = $.effect;
var append = $.append;
var xmlns = "http://www.w3.org/2000/svg";

function setAttribute(el, name, value){
	if( value === null ){
		el.removeAttributeNS(null, name);
	}else{
		el.setAttributeNS(null, name, value);
	}
}

function bindAttribute(el, name, value){
	if( value === true ) value = "";
	if( value === false ) value = null;
	switch( typeof value ){
		case "object":
			if(!value){
				setAttribute(el, name, value);
			}else if( value.effect ){
				value.effect(function(v){
					setAttribute(el, name, v);
				});
			}else{
				bind(el[name], value);
			}
			break;
		case "function":
			if( name.indexOf("on") === 0 ){
				on(name.substring(2), value)(el);
			}else{
				addEffect(function(){
					setAttribute(el, name, value());
				});
			}
			break;
		default:
			setAttribute(el, name, value);
	}
}

function bindAttributes(el, attributes){
	for(var name in attributes){
		bindAttribute(el, name, attributes[name]);
	}
}

function svgTag(tagName){
	return function(){
		var el = document.createElementNS(xmlns, tagName);
		append(el, arguments, el, bindAttributes);
		return el;
	};
}

$.svgTag = svgTag;

})($, document);
