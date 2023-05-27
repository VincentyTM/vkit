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
		throw new Error("Cannot set dynamic attribute (" + name + ") on the server");
	}else if( value && typeof value.effect === "function" ){
		if( typeof value.get === "function" ){
			setAttribute(el, name, value.get());
		}else{
			throw new Error("Cannot call effect without get method");
		}
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
