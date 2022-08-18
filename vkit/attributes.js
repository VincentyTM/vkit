(function($){

function bindAttribute(el, name, value){
	if( typeof value === "number" ){
		value = value.toString();
	}
	if( typeof value === "string" ){
		el.setAttribute(name, value);
	}else if( value && typeof value.effect === "function" ){
		value.effect(function(val){
			if( typeof val === "number" ){
				val = val.toString();
			}
			if( typeof val === "string" ){
				el.setAttribute(name, val);
			}else if( val ){
				el.setAttribute(name, "");
			}else{
				el.removeAttribute(name);
			}
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
