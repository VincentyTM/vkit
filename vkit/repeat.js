(function($){

var MAX_COUNT = 9007199254740991;

function getNumber(num){
	if( typeof num !== "number" ){
		throw new TypeError("Repeat count can only be a number");
	}
	
	return !(num >= 0) ? 0 : num >= MAX_COUNT ? MAX_COUNT : Math.floor(num);
}

function createRangeArray(length){
	length = getNumber(length);
	
	var array = new Array(length);
	
	for(var i=0; i<length; ++i){
		array[i] = i;
	}
	
	return array;
}

function repeat(count, getView){
	if( count && typeof count.map === "function" ){
		var arrayState = count.map(createRangeArray);
		
		return arrayState.views(getView);
	}
	
	count = getNumber(count);
	
	var array = new Array(count);
	
	for(var i=0; i<count; ++i){
		array[i] = getView(i);
	}
	
	return array;
}

$.range = createRangeArray;
$.repeat = repeat;

})($);
