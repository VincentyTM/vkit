(function($){

function ifElseSlice(args, offset, argsCount){
	if( argsCount < 2 ){
		return argsCount === 1 ? args[offset]() : null;
	}
	
	return args[offset].map(Boolean).view(function(value){
		return value ? args[offset + 1]() : ifElseSlice(args, offset + 2, argsCount - 2);
	});
}

function ifElse(){
	return ifElseSlice(arguments, 0, arguments.length);
}

$.ifElse = ifElse;

})($);
