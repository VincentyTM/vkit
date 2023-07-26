var scope = null;

function replaceStyleEnds(text){
	return '<\\/' + text.substring(2);
}

function createScope(req, res){
	var styles = [];
	var styleCount = 0;
	var windowData = {};
	
	function addStyle(css){
		styles.push(css);
	}
	
	function getStyles(){
		return styles.join('\n').replace(/<\/style\b/ig, replaceStyleEnds);
	}
	
	function getWindowData(name, value){
		var parts = windowData[name];
		
		if( parts ){
			var n = parts.length;
			
			for(var i=0; i<n; ++i){
				var part = parts[i];
				
				if( part && typeof part.get === "function" ){
					part = part.get();
				}
				
				if( typeof part === "function" ){
					value = part(value);
				}else{
					value = part;
				}
			}
		}
		
		return value;
	}
	
	function nextStyleCount(){
		return ++styleCount;
	}
	
	function renderStyle(res){
		res.write(getStyles());
	}
	
	function style(){
		return {
			toHTML: renderStyle,
			toStyleContent: renderStyle
		};
	}
	
	return {
		addStyle: addStyle,
		getStyles: getStyles,
		getWindowData: getWindowData,
		nextStyleCount: nextStyleCount,
		render: null,
		req: req,
		res: res,
		style: style
	};
}

function getScope(allowNullScope){
	if(!scope && !allowNullScope){
		throw new Error("This function can only be called synchronously from a component");
	}
	return scope;
}

function setScope(newScope){
	scope = newScope;
}

module.exports = {
	create: createScope,
	get: getScope,
	set: setScope
};
