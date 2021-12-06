(function($){

var isView = $.is;

function getConditionalView(condition, getView){
	return typeof condition.map === "function"
		? condition.map(Boolean).view(getView)
		: isView(function(){ return !!condition() }, getView);
}

function ifElseSlice(args, offset, argsCount){
	if( argsCount < 2 ){
		return argsCount === 1 ? args[offset]() : null;
	}
	return getConditionalView(args[offset], function(value){
		return value ? args[offset + 1]() : ifElseSlice(args, offset + 2, argsCount - 2);
	});
}

function ifElse(){
	return ifElseSlice(arguments, 0, arguments.length);
}

$.ifElse = ifElse;

})($);
