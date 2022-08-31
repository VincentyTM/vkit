(function($){

var getCurrentComponent = $.currentComponent;

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
		var oldValue = value();
		setAttribute(el, name, oldValue);
		getCurrentComponent().subscribe(function(){
			var newValue = value();
			if( oldValue !== newValue ){
				oldValue = newValue;
				setAttribute(el, name, newValue);
			}
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
