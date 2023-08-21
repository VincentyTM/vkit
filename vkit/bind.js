(function($){

var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var prop = $.prop;

function bind(el, props, persistent){
	for(var name in props){
		var value = props[name];
		
		switch( typeof value ){
			case "object":
				if(!value){
					el[name] = value;
				}else if( value.prop ){
					value.prop(name)(el);
				}else{
					var obj = el[name];
					
					if( obj ){
						bind(obj, value, persistent);
					}else{
						el[name] = value;
					}
				}
				
				break;
			case "function":
				if( name.indexOf("on") === 0 ){
					var unsub = onEvent(el, name.substring(2), value);
					
					if(!persistent){
						onUnmount(unsub);
					}
				}else{
					prop(name, value)(el);
				}
				
				break;
			case "undefined":
				break;
			default:
				el[name] = value;
		}
	}
}

$.bind = bind;

})($);
