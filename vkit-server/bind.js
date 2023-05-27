function bind(el, props){
	for(var prop in props){
		var value = props[prop];
		switch( typeof value ){
			case "object":
				if(!value){
					el.setProperty(prop, value);
				}else if( value.prop ){
					value.prop(prop)(el);
				}else{
					var obj = el.getProperty(prop);
					if( obj ){
						throw new Error("Property '" + prop + "' already exists on element");
					}else if( prop === "style" ){
						throw new Error("Cannot set inline style on the server, use $.style instead");
					}else{
						el.setProperty(prop, value);
					}
				}
				break;
			case "function":
				if( prop.indexOf("on") === 0 ){
					throw new Error("Cannot add event listener (" + prop + ") on the server");
				}else{
					throw new Error("Cannot bind dynamic property (" + prop + ") on the server");
				}
				break;
			case "undefined":
				break;
			default:
				el.setProperty(prop, value);
		}
	}
}

module.exports = bind;
