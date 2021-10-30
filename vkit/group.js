(function($, undefined){

function noop(){}

function deepPush(array, item, parent, appendObject){
	if( item === null || item === undefined ){
	}else if( typeof item !== "object" ){
		if( typeof item === "function" ){
			item(parent);
		}else{
			array.push(document.createTextNode(item));
		}
	}else if( item.nodeType ){
		array.push(item);
	}else if( typeof item.text === "function" ){
		deepPush(array, item.text(), parent, appendObject);
	}else if( typeof item.render === "function" ){
		deepPush(array, item.render(), parent, appendObject);
	}else{
		var n = item.length;
		if( typeof n === "number" ){
			var a = $.fn.toArray.call(item);
			for(var i=0; i<n; ++i){
				deepPush(array, a[i], parent, appendObject);
			}
		}else{
			appendObject(parent, item);
		}
	}
	return array;
}

function group(){
	return deepPush($(), arguments, null, noop);
}

function append(parent, children, appendObject){
	function push(node){
		parent.appendChild(node);
	}
	var pusher = {push: push};
	if( document.createDocumentFragment ){
		var container = parent;
		parent = document.createDocumentFragment();
		deepPush(pusher, children, container, appendObject);
		container.appendChild(parent);
	}else{
		deepPush(pusher, children, parent, appendObject);
	}
}

$.group = group;
$.append = append;

})($);
