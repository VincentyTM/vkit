(function($){

function compose(){
	var functions = arguments;
	var n = arguments.length;
	return function(){
		var arg = functions[0].apply(this, arguments);
		for(var i=1; i<n; ++i){
			arg = functions[i].call(this, arg);
		}
		return arg;
	};
}

$.compose = compose;

})($);
