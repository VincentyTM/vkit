(function($){

var getComponent = $.getComponent;
var onUpdate = $.onUpdate;

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
	}else if( typeof value === "function" ){
		var oldValue = value();
		setAttribute(el, name, oldValue);
		
		onUpdate(
			function(){
				var newValue = value();
				if( oldValue !== newValue ){
					oldValue = newValue;
					setAttribute(el, name, newValue);
				}
			},
			
			getComponent()
		);
	}else if( value && typeof value.effect === "function" ){
		value.effect(function(val){
			setAttribute(el, name, val);
		});
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
