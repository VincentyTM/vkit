var scope = null;

function replaceStyleEnds(text){
	return '<\\/' + text.substring(2);
}

function createScope(req, res){
	var styles = [];
	var styleCount = 0;
	
	function addStyle(css){
		styles.push(css);
	}
	
	function getStyles(){
		return styles.join('\n').replace(/<\/style\b/ig, replaceStyleEnds);
	}
	
	function nextStyleCount(){
		return ++styleCount;
	}
	
	return {
		addStyle: addStyle,
		getStyles: getStyles,
		nextStyleCount: nextStyleCount,
		render: null,
		req: req,
		res: res
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
