(function($){

var effect = $.effect;

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

function bindAttribute(el, name, value){
	if( typeof value === "number" ){
		value = value.toString();
	}
	if( typeof value === "string" ){
		el.setAttribute(name, value);
	}else if( typeof value === "function" ){
		effect(function(){
			setAttribute(el, name, value());
		});
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

function bindAttributes(attrs){
	return function(el){
		for(var name in attrs){
			bindAttribute(el, name, attrs[name]);
		}
	};
}

$.attributes = bindAttributes;

})($);
