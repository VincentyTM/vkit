(function($, undefined){

function deepPush(array, item){
	if( item === null || item === undefined ){
	}else if( typeof item !== "object" ){
		array.push(document.createTextNode(item));
	}else if( item.nodeType ){
		array.push(item);
	}else if( typeof item.text === "function" ){
		array.push(item.text());
	}else{
		var n = item.length;
		if( typeof n === "number" ){
			for(var i=0; i<n; ++i){
				deepPush(array, item[i]);
			}
		}
	}
	return array;
}

$.group = function(){
	return deepPush($(), arguments);
};

})($);
