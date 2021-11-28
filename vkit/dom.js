(function($, document){

function createText(text){
	return $(document.createTextNode(text));
}

function create(tag, count){
	var elems = $();
	if( typeof count !== "number" ){
		count = 1;
	}
	for(var i=0; i<count; ++i){
		elems.push(document.createElement(tag));
	}
	return elems;
}

function add(tag, count){
	var elems = $();
	elems.end = this;
	if( typeof count !== "number" ){
		count = 1;
	}
	for(var j=0, l=this.length; j<l; ++j){
		var parent = this[j];
		for(var i=0; i<count; ++i){
			var child = parent.ownerDocument.createElement(tag);
			parent.appendChild(child);
			elems.push(child);
		}
	}
	return elems;
}

function setHTML(html){
	for(var i=this.length; i--;){
		this[i].innerHTML = html;
	}
	return this;
}

function remove(){
	for(var i=this.length; i--;){
		var child = this[i];
		var parent = c.parentNode;
		if( parent ){
			parent.removeChild(child);
		}
	}
	return this;
}

function empty(){
	for(var i=this.length; i--;){
		var el = this[i];
		while( el.firstChild ){
			el.removeChild(el.lastChild);
		}
	}
	return this;
}

$.createText = createText;
$.create = create;
$.fn.add = add;
$.fn.html = setHTML;
$.fn.empty = empty;
$.fn.remove = remove;

})($, document);
