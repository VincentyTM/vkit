(function($){

var getCurrentComponent = $.currentComponent;
var onEvent = $.onEvent;
var unmount = $.unmount;

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

function bind(el, props, persistent){
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
						bind(obj, value, persistent);
					}else{
						el[prop] = value;
					}
				}
				break;
			case "function":
				if( prop.indexOf("on") === 0 ){
					var unsub = onEvent(el, prop.substring(2), value);
					if(!persistent){
						unmount(unsub);
					}
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
