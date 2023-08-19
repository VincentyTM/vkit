(function($){

var createDynamicProp = $.prop;
var getComponent = $.getComponent;
var setComponent = $.setComponent;
var onEvent = $.onEvent;
var onUnmount = $.unmount;

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
						onUnmount(unsub);
					}
				}else{
					createDynamicProp(prop, value)(el);
				}
				break;
			case "undefined":
				break;
			default:
				el[prop] = value;
		}
	}
}

$.bind = bind;

})($);
