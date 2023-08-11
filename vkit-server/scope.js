var escapeHTML = require("./escapeHTML");
var scope = null;

function replaceStyleEnds(text){
	return '<\\/' + text.substring(2);
}

function createScope(req, res){
	var styles = [];
	var styleCount = 0;
	var styleKeys = {};
	var windowData = {};
	
	function addStyle(key, css){
		if(!(key in styleKeys)){
			styleKeys[key] = true;
			styles.push(css);
		}
	}
	
	function addWindowData(name, value){
		if( windowData[name] ){
			windowData[name].push(value);
		}else{
			windowData[name] = [value];
		}
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
	
	function meta(name, content){
		return {
			toHTML: function(res){
				renderWindowData(res, "meta:" + content, content);
			}
		};
	}
	
	function nextStyleCount(){
		return ++styleCount;
	}
	
	function renderStyle(res){
		res.write(getStyles());
	}
	
	function renderWindowData(res, name, value){
		res.write(escapeHTML(getWindowData(name, value)));
	}
	
	function style(){
		return {
			toHTML: renderStyle,
			toStyleContent: renderStyle
		};
	}
	
	function title(value){
		return {
			toHTML: function(res){
				renderWindowData(res, "title", value);
			}
		};
	}
	
	return {
		addStyle: addStyle,
		addWindowData: addWindowData,
		getStyles: getStyles,
		getWindowData: getWindowData,
		meta: meta,
		nextStyleCount: nextStyleCount,
		render: null,
		req: req,
		res: res,
		style: style,
		title: title
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
