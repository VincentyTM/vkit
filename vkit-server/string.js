var createComputedSignal = require("./signal").computed;
var slice = Array.prototype.slice;

function templateTag(strings){
	var n = strings.length;
	var inputs = slice.call(arguments, 1);
	
	function getValue(){
		var a = new Array(2*n - 1);
		
		if( n > 0 ){
			a[0] = strings[0];
		}
		
		for(var i=1, j=1; i<n; ++i){
			a[j++] = arguments[i - 1];
			a[j++] = strings[i];
		}
		
		return a.join("");
	}
	
	return createComputedSignal(getValue, inputs);
}

module.exports = templateTag;
