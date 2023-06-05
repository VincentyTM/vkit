function bind(el, props){
	for(var prop in props){
		var value = props[prop];
		switch(typeof value){
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
						for(var styleProp in value){
							el.setStyleProperty(styleProp, value[styleProp]);
						}
					}else{
						el.setProperty(prop, value);
					}
				}
				break;
			case "function":
				if( prop.indexOf("on") !== 0 ){
					el.setProperty(prop, value());
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
