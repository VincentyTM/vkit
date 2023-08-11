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
	}else if( value && typeof value.get === "function" ){
		setAttribute(el, name, value.get());
	}else if( typeof value === "function" ){
		setAttribute(el, name, value());
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

module.exports = bindAttributes;
