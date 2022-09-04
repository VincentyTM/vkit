(function($){

var getCurrentComponent = $.currentComponent;
var on = $.on;

function bindProp(prop, getter){
	return function(element){
		var oldValue = element[prop] = getter(element);
		getCurrentComponent().subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = element[prop] = value;
			}
		});
	};
}

function createText(getter){
	var oldValue = String(getter());
	var node = document.createTextNode(oldValue);
	getCurrentComponent().subscribe(function(){
		var value = String(getter());
		if( oldValue!==value ){
			oldValue = node.nodeValue = value;
		}
	});
	return node;
}

function createEffect(setter){
	setter();
	getCurrentComponent().subscribe(setter);
}

function bind(el, props){
	for(var prop in props){
		var value = props[prop];
		switch( typeof value ){
			case "object":
				if(!value){
					el[prop] = value;
				}else if( value.prop ){
					value.prop(prop)(el);
				}else{
					var obj = el[prop];
					if( obj ){
						bind(obj, value);
					}else{
						el[prop] = value;
					}
				}
				break;
			case "function":
				if( prop.indexOf("on") === 0 ){
					on(prop.substring(2), value)(el);
				}else{
					bindProp(prop, value)(el);
				}
				break;
			default:
				el[prop] = value;
		}
	}
}

function bindAll(props){
	var n = this.length;
	for(var i=0; i<n; ++i){
		bind(this[i], props);
	}
	return this;
}

$.text = createText;
$.effect = createEffect;
$.bind = bind;
$.bindProp = bindProp;
$.fn.bind = bindAll;

})($);
