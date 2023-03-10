(function($){

var getComponent = $.getComponent;
var setComponent = $.setComponent;
var onEvent = $.onEvent;
var unmount = $.unmount;

function bindProp(prop, getter){
	return function(element){
		var component = getComponent();
		setComponent(null);
		var oldValue = element[prop] = getter(element);
		setComponent(component);
		component.subscribe(function(){
			var value = getter(element);
			if( oldValue !== value ){
				oldValue = element[prop] = value;
			}
		});
	};
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
			case "undefined":
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

$.bind = bind;
$.bindProp = bindProp;
$.fn.bind = bindAll;

})($);
