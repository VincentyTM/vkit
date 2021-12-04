(function($, document, undefined){

function deepPush(array, item, context, setProps){
	if( item === null || item === undefined ){
	}else if( typeof item !== "object" ){
		if( typeof item === "function" ){
			item(context);
		}else{
			array.push(document.createTextNode(item));
		}
	}else if( item.nodeType ){
		array.push(item);
	}else if( typeof item.text === "function" ){
		deepPush(array, item.text(), context, setProps);
	}else if( typeof item.render === "function" ){
		deepPush(array, item.render(), context, setProps);
	}else if( typeof item.next === "function" ){
		var x;
		do{
			x = item.next();
			deepPush(array, x.value, context, setProps);
		}while(!x.done);
	}else{
		var n = item.length;
		if( typeof n === "number" ){
			var a = $.fn.toArray.call(item);
			for(var i=0; i<n; ++i){
				deepPush(array, a[i], context, setProps);
			}
		}else if( setProps ){
			setProps(context, item);
		}
	}
	return array;
}

function group(){
	return deepPush($(), arguments, null, null);
}

$.group = group;
$.deepPush = deepPush;

})($, document);
