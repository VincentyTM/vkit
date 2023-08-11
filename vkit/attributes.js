(function($){

var createComponent = $.component;
var getComponent = $.getComponent;

function setAttribute(el, name, value){
	if( typeof value === "number" ){
		value = value.toString();
	}
	
	if( typeof value === "string" ){
		el.setAttribute(name, value);
	}else if( value ){
		el.setAttribute(name, "");
	}else{
		el.removeAttribute(name);
	}
}

function addAttribute(el, name, value){
	if( typeof value === "number" ){
		value = value.toString();
	}
	
	if( typeof value === "string" ){
		el.setAttribute(name, value);
	}else if( value && typeof value.effect === "function" ){
		value.effect(function(val){
			setAttribute(el, name, val);
		});
	}else if( typeof value === "function" ){
		function setValue(){
			setAttribute(el, name, value());
		}
		
		createComponent(setValue).render();
	}else if( value ){
		el.setAttribute(name, "");
	}else{
		el.removeAttribute(name);
	}
}

function bindAttribute(name, value){
	return function(el){
		addAttribute(el, name, value);
	};
}

function bindAttributes(attrs){
	return function(el){
		for(var name in attrs){
			addAttribute(el, name, attrs[name]);
		}
	};
}

$.attribute = bindAttribute;
$.attributes = bindAttributes;

})($);
